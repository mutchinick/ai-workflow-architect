import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { EventStoreEvent, EventStoreEventConstructor } from '../../event-store/EventStoreEvent'
import { EventStoreEventName } from '../../event-store/EventStoreEventName'

/**
 *
 */
const dataSchema = z.object({
  jobId: z.string().trim().min(6),
  created: z.literal(true),
})

export type JobCreatedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

/**
 *
 */
export class JobCreatedEvent extends EventStoreEvent<JobCreatedEventData> {
  public static readonly eventName = EventStoreEventName.JOB_CREATED_EVENT

  /**
   *
   */
  private constructor(eventData: JobCreatedEventData, idempotencyKey: string, createdAt: string) {
    super(JobCreatedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(eventData: JobCreatedEventData): Success<JobCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'JobCreatedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new JobCreatedEvent(validData, idempotencyKey, new Date().toISOString())
      const eventResult = Result.makeSuccess(event)
      console.info(`${logCtx} exit success:`, { eventResult, eventData })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, eventData })
      return failure
    }
  }

  /**
   *
   */
  private static generateIdempotencyKey(eventData: JobCreatedEventData): string {
    return `jobId:${eventData.jobId}:created:${eventData.created}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: JobCreatedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<JobCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'JobCreatedEvent.reconstitute'

    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new JobCreatedEvent(validEvent.eventData, idempotencyKey, createdAt)
      const eventResult = Result.makeSuccess(event)
      console.info(`${logCtx} exit success:`, { eventResult, eventData })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, eventData })
      return failure
    }
  }
}

/**
 * This check ensures the class adheres to the static contract defined
 * by EventStoreEventConstructor. It will cause a compile-time error if
 * fromData or reconstitute are missing or have the wrong signature.
 */
const _ConstructorCheck: EventStoreEventConstructor = JobCreatedEvent
