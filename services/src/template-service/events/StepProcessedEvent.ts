import { z } from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { EventStoreEvent, EventStoreEventConstructor } from '../../event-store/EventStoreEvent'
import { EventStoreEventName } from '../../event-store/EventStoreEventName'

/**
 *
 */
const dataSchema = z.object({
  jobId: z.string().trim().min(6),
  processed: z.literal(true),
})

export type StepProcessedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

/**
 *
 */
export class StepProcessedEvent extends EventStoreEvent<StepProcessedEventData> {
  public static readonly eventName = EventStoreEventName.STEP_PROCESSED_EVENT

  /**
   *
   */
  private constructor(eventData: StepProcessedEventData, idempotencyKey: string, createdAt: string) {
    super(StepProcessedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(eventData: StepProcessedEventData): Success<StepProcessedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'StepProcessedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new StepProcessedEvent(validData, idempotencyKey, new Date().toISOString())
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
  private static generateIdempotencyKey(eventData: StepProcessedEventData): string {
    return `jobId:${eventData.jobId}:processed:${eventData.processed}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: StepProcessedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<StepProcessedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'StepProcessedEvent.reconstitute'

    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new StepProcessedEvent(validEvent.eventData, idempotencyKey, createdAt)
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
const _ConstructorCheck: EventStoreEventConstructor = StepProcessedEvent
