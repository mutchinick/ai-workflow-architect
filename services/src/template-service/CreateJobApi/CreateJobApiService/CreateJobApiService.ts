import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { JobCreatedEvent, JobCreatedEventData } from '../../events/JobCreatedEvent'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { IncomingCreateJobRequest } from '../model/IncomingCreateJobRequest'

export interface ICreateJobApiService {
  createJob: (
    incomingRequest: IncomingCreateJobRequest,
  ) => Promise<Success<CreateJobApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>>
}

export type CreateJobApiServiceOutput = TypeUtilsPretty<IncomingCreateJobRequest>

/**
 *
 */
export class CreateJobApiService implements ICreateJobApiService {
  /**
   *
   */
  constructor(private readonly eventStoreClient: IEventStoreClient) {}

  /**
   *
   */
  public async createJob(
    incomingRequest: IncomingCreateJobRequest,
  ): Promise<Success<CreateJobApiServiceOutput> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'CreateJobApiService.createJob'
    console.info(`${logCtx} init:`, { incomingRequest })

    const inputValidationResult = this.validateInput(incomingRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingRequest })
      return inputValidationResult
    }

    const publishEventResult = await this.publishJobCreatedEvent(incomingRequest)
    if (Result.isSuccess(publishEventResult)) {
      const serviceOutput: CreateJobApiServiceOutput = { ...incomingRequest }
      const serviceOutputResult = Result.makeSuccess(serviceOutput)
      console.info(`${logCtx} exit success:`, { serviceOutputResult, incomingRequest })
      return serviceOutputResult
    }

    if (Result.isFailureOfKind(publishEventResult, 'DuplicateEventError')) {
      const serviceOutput: CreateJobApiServiceOutput = { ...incomingRequest }
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
  private validateInput(incomingRequest: IncomingCreateJobRequest): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'CreateJobApiService.validateInput'
    console.info(`${logCtx} init:`, { incomingRequest })

    if (incomingRequest instanceof IncomingCreateJobRequest === false) {
      const message = `Expected IncomingCreateJobRequest but got ${incomingRequest}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingRequest })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async publishJobCreatedEvent(
    incomingRequest: IncomingCreateJobRequest,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'CreateJobApiService.publishJobCreatedEvent'
    console.info(`${logCtx} init:`, { incomingRequest })

    const { jobId } = incomingRequest
    const eventData: JobCreatedEventData = { jobId, created: true }
    const buildEventResult = JobCreatedEvent.fromData(eventData)
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
