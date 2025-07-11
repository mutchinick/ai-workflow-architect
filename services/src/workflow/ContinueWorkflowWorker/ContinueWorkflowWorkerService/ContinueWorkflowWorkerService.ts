import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { WorkflowContinuedEvent, WorkflowContinuedEventData } from '../../../events/WorkflowContinuedEvent'
import { WorkflowStartedEvent } from '../../../events/WorkflowStartedEvent'

export interface IContinueWorkflowWorkerService {
  continueWorkflow: (
    incomingEvent: WorkflowStartedEvent,
  ) => Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class ContinueWorkflowWorkerService implements IContinueWorkflowWorkerService {
  /**
   *
   */
  constructor(private readonly eventStoreClient: IEventStoreClient) {}

  /**
   *
   */
  public async continueWorkflow(
    incomingEvent: WorkflowStartedEvent,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ContinueWorkflowWorkerService.continueWorkflow'
    console.info(`${logCtx} init:`, { incomingEvent })

    const inputValidationResult = this.validateInput(incomingEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingEvent })
      return inputValidationResult
    }

    const publishEventResult = await this.publishWorkflowContinuedEvent(incomingEvent)
    if (Result.isFailure(publishEventResult)) {
      console.error(`${logCtx} exit failure:`, { publishEventResult, incomingEvent })
      return publishEventResult
    }

    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, incomingEvent })
      : console.info(`${logCtx} exit success:`, { publishEventResult, incomingEvent })

    return publishEventResult
  }

  /**
   *
   */
  private validateInput(incomingEvent: WorkflowStartedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ContinueWorkflowWorkerService.validateInput'
    console.info(`${logCtx} init:`, { incomingEvent })

    if (incomingEvent instanceof WorkflowStartedEvent === false) {
      const message = `Expected WorkflowStartedEvent but got ${incomingEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingEvent })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async publishWorkflowContinuedEvent(
    incomingEvent: WorkflowStartedEvent,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ContinueWorkflowWorkerService.publishWorkflowContinuedEvent'
    console.info(`${logCtx} init:`, { incomingEvent })

    const workflowId = incomingEvent.eventData.workflowId
    const eventData: WorkflowContinuedEventData = { workflowId, continued: true }
    const buildEventResult = WorkflowContinuedEvent.fromData(eventData)
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
