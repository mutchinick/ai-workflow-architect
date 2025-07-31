import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { WorkflowCreatedEvent, WorkflowCreatedEventData } from '../../events/WorkflowCreatedEvent'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'
import { IncomingSendQueryRequest } from '../IncomingSendQueryRequest/IncomingSendQueryRequest'

export interface ISendQueryApiService {
  sendQuery: (
    incomingRequest: IncomingSendQueryRequest,
  ) => Promise<
    | Success<SendQueryApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateWorkflowError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  >
}

export type SendQueryApiServiceOutput = TypeUtilsPretty<
  IncomingSendQueryRequest & { workflowId: string; objectKey: string }
>

/**
 *
 */
export class SendQueryApiService implements ISendQueryApiService {
  /**
   *
   */
  constructor(
    private readonly saveWorkflowClient: ISaveWorkflowClient,
    private readonly eventStoreClient: IEventStoreClient,
  ) {}

  /**
   *
   */
  public async sendQuery(
    incomingRequest: IncomingSendQueryRequest,
  ): Promise<
    | Success<SendQueryApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateWorkflowError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'SendQueryApiService.sendQuery'
    console.info(`${logCtx} init:`, { incomingRequest })

    const inputValidationResult = this.validateInput(incomingRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingRequest })
      return inputValidationResult
    }

    const createWorkflowResult = await this.createWorkflow(incomingRequest)
    if (Result.isFailure(createWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { createWorkflowResult, incomingRequest })
      return createWorkflowResult
    }

    const workflow = createWorkflowResult.value
    const workflowId = workflow.workflowId
    const objectKey = workflow.getObjectKey()
    const publishEventResult = await this.publishWorkflowCreatedEvent(workflowId, objectKey)
    if (Result.isSuccess(publishEventResult)) {
      const serviceOutput: SendQueryApiServiceOutput = { ...incomingRequest, workflowId, objectKey }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logCtx} exit success:`, { serviceOutputResult, incomingRequest })
      return serviceOutputResult
    }

    if (Result.isFailureOfKind(publishEventResult, 'DuplicateEventError')) {
      const serviceOutput: SendQueryApiServiceOutput = { ...incomingRequest, workflowId, objectKey }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logCtx} exit success: from-error:`, {
        publishEventResult,
        serviceOutputResult,
        incomingRequest,
      })
      return serviceOutputResult
    }

    console.error(`${logCtx} exit failure:`, { publishEventResult, incomingRequest })
    return publishEventResult
  }

  /**
   *
   */
  private validateInput(incomingRequest: IncomingSendQueryRequest): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'SendQueryApiService.validateInput'
    console.info(`${logCtx} init:`, { incomingRequest })

    if (incomingRequest instanceof IncomingSendQueryRequest === false) {
      const message = `Expected IncomingSendQueryRequest but got ${incomingRequest}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingRequest })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async createWorkflow(
    incomingRequest: IncomingSendQueryRequest,
  ): Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'DuplicateWorkflowError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'SendQueryApiService.createWorkflow'
    console.info(`${logCtx} init:`, { incomingRequest })

    const { query } = incomingRequest
    const workflowResult = Workflow.fromInstructions({ query })
    if (Result.isFailure(workflowResult)) {
      console.error(`${logCtx} exit failure:`, { workflowResult, incomingRequest })
      return workflowResult
    }

    const workflow = workflowResult.value
    const saveWorkflowResult = await this.saveWorkflowClient.save(workflow)
    if (Result.isFailure(saveWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { saveWorkflowResult, incomingRequest })
      return saveWorkflowResult
    }

    return workflowResult
  }

  /**
   *
   */
  private async publishWorkflowCreatedEvent(
    workflowId: string,
    objectKey: string,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'SendQueryApiService.publishWorkflowCreatedEvent'
    console.info(`${logCtx} init:`, { workflowId, objectKey })

    const eventData: WorkflowCreatedEventData = {
      workflowId,
      objectKey,
    }

    const buildEventResult = WorkflowCreatedEvent.fromData(eventData)
    if (Result.isFailure(buildEventResult)) {
      console.error(`${logCtx} exit failure:`, { buildEventResult, eventData })
      return buildEventResult
    }

    const event = buildEventResult.value
    const publishEventResult = await this.eventStoreClient.publish(event)
    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, event })
      : console.info(`${logCtx} exit success:`, { publishEventResult, event })

    return publishEventResult
  }
}
