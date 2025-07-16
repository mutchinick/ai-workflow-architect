import KSUID from 'ksuid'
import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { WorkflowCreatedEvent, WorkflowCreatedEventData } from '../../events/WorkflowCreatedEvent'
import { IncomingSendQueryRequest } from '../IncomingSendQueryRequest/IncomingSendQueryRequest'

export interface ISendQueryApiService {
  sendQuery: (
    incomingRequest: IncomingSendQueryRequest,
  ) => Promise<Success<SendQueryApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
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
  constructor(private readonly eventStoreClient: IEventStoreClient) {}

  /**
   *
   */
  public async sendQuery(
    incomingRequest: IncomingSendQueryRequest,
  ): Promise<Success<SendQueryApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'SendQueryApiService.sendQuery'
    console.info(`${logCtx} init:`, { incomingRequest })

    const workflowId = KSUID.randomSync().string
    const objectKey = `workflow-${workflowId}-${new Date().toISOString()}-created`

    const inputValidationResult = this.validateInput(incomingRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingRequest })
      return inputValidationResult
    }

    const publishEventResult = await this.publishWorkflowCreatedEvent(incomingRequest, workflowId, objectKey)
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
  private async publishWorkflowCreatedEvent(
    incomingRequest: IncomingSendQueryRequest,
    workflowId: string,
    objectKey: string,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'SendQueryApiService.publishWorkflowCreatedEvent'
    console.info(`${logCtx} init:`, { incomingRequest })

    const { enhancePromptRounds, enhanceResultRounds } = incomingRequest
    const eventData: WorkflowCreatedEventData = {
      workflowId,
      objectKey,
      enhancePromptRounds,
      enhanceResultRounds,
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
