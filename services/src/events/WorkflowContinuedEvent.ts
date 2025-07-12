import { z } from 'zod'
import { Failure, Result, Success } from '../errors/Result'
import { EventStoreEvent, EventStoreEventConstructor } from '../event-store/EventStoreEvent'
import { EventStoreEventName } from '../event-store/EventStoreEventName'

/**
 *
 */
const dataSchema = z.object({
  workflowId: z.string().trim().min(6),
  continued: z.literal(true),
})

export type WorkflowContinuedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

/**
 *
 */
export class WorkflowContinuedEvent extends EventStoreEvent<WorkflowContinuedEventData> {
  public static readonly eventName = EventStoreEventName.WORKFLOW_CONTINUED_EVENT

  /**
   *
   */
  private constructor(eventData: WorkflowContinuedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowContinuedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(
    eventData: WorkflowContinuedEventData,
  ): Success<WorkflowContinuedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowContinuedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowContinuedEvent(validData, idempotencyKey, new Date().toISOString())
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
  private static generateIdempotencyKey(eventData: WorkflowContinuedEventData): string {
    return `workflowId:${eventData.workflowId}:continued:${eventData.continued}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: WorkflowContinuedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowContinuedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowContinuedEvent.reconstitute'
    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new WorkflowContinuedEvent(validEvent.eventData, idempotencyKey, createdAt)
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
const _ConstructorCheck: EventStoreEventConstructor = WorkflowContinuedEvent
