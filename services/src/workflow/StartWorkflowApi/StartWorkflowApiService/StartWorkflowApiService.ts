import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { WorkflowStartedEvent, WorkflowStartedEventData } from '../../../events/WorkflowStartedEvent'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { IncomingStartWorkflowRequest } from '../model/IncomingStartWorkflowRequest'

export interface IStartWorkflowApiService {
  startWorkflow: (
    incomingRequest: IncomingStartWorkflowRequest,
  ) => Promise<Success<StartWorkflowApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type StartWorkflowApiServiceOutput = TypeUtilsPretty<IncomingStartWorkflowRequest>

/**
 *
 */
export class StartWorkflowApiService implements IStartWorkflowApiService {
  /**
   *
   */
  constructor(private readonly eventStoreClient: IEventStoreClient) {}

  /**
   *
   */
  public async startWorkflow(
    incomingRequest: IncomingStartWorkflowRequest,
  ): Promise<Success<StartWorkflowApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'StartWorkflowApiService.startWorkflow'
    console.info(`${logCtx} init:`, { incomingRequest })

    const inputValidationResult = this.validateInput(incomingRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingRequest })
      return inputValidationResult
    }

    const publishEventResult = await this.publishWorkflowStartedEvent(incomingRequest)
    if (Result.isSuccess(publishEventResult)) {
      const serviceOutput: StartWorkflowApiServiceOutput = { ...incomingRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logCtx} exit success:`, { serviceOutputResult, incomingRequest })
      return serviceOutputResult
    }

    if (Result.isFailureOfKind(publishEventResult, 'DuplicateEventError')) {
      const serviceOutput: StartWorkflowApiServiceOutput = { ...incomingRequest }
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
  private validateInput(
    incomingRequest: IncomingStartWorkflowRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'StartWorkflowApiService.validateInput'
    console.info(`${logCtx} init:`, { incomingRequest })

    if (incomingRequest instanceof IncomingStartWorkflowRequest === false) {
      const errorMessage = `Expected IncomingStartWorkflowRequest but got ${incomingRequest}`
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', errorMessage, false)
      console.error(`${logCtx} exit failure:`, { invalidArgsFailure, incomingRequest })
      return invalidArgsFailure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async publishWorkflowStartedEvent(
    incomingRequest: IncomingStartWorkflowRequest,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'StartWorkflowApiService.publishWorkflowStartedEvent'
    console.info(`${logCtx} init:`, { incomingRequest })

    const { workflowId } = incomingRequest
    const eventData: WorkflowStartedEventData = { workflowId, started: true }
    const buildEventResult = WorkflowStartedEvent.fromData(eventData)
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
