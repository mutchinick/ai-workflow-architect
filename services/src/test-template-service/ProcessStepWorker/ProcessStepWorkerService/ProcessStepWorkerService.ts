import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { StepProcessedEvent, StepProcessedEventData } from '../../events/StepProcessedEvent'
import { JobCreatedEvent } from '../../events/JobCreatedEvent'

export interface IProcessStepWorkerService {
  processStep: (
    incomingEvent: JobCreatedEvent,
  ) => Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class ProcessStepWorkerService implements IProcessStepWorkerService {
  /**
   *
   */
  constructor(private readonly eventStoreClient: IEventStoreClient) {}

  /**
   *
   */
  public async processStep(
    incomingEvent: JobCreatedEvent,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessStepWorkerService.processStep'
    console.info(`${logCtx} init:`, { incomingEvent })

    const inputValidationResult = this.validateInput(incomingEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingEvent })
      return inputValidationResult
    }

    const publishEventResult = await this.publishStepProcessedEvent(incomingEvent)
    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, incomingEvent })
      : console.info(`${logCtx} exit success:`, { publishEventResult, incomingEvent })

    return publishEventResult
  }

  /**
   *
   */
  private validateInput(incomingEvent: JobCreatedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ProcessStepWorkerService.validateInput'
    console.info(`${logCtx} init:`, { incomingEvent })

    if (incomingEvent instanceof JobCreatedEvent === false) {
      const message = `Expected JobCreatedEvent but got ${incomingEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingEvent })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async publishStepProcessedEvent(
    incomingEvent: JobCreatedEvent,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessStepWorkerService.publishStepProcessedEvent'
    console.info(`${logCtx} init:`, { incomingEvent })

    const jobId = incomingEvent.eventData.jobId
    const eventData: StepProcessedEventData = { jobId, processed: true }
    const buildEventResult = StepProcessedEvent.fromData(eventData)
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
