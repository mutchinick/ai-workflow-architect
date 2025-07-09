import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase, EventStoreEventConstructor } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

/**
 *
 */
const dataSchema = z.object({
  workflowId: z.string().trim().min(6),
  started: z.literal(true),
})

export type WorkflowStartedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

/**
 *
 */
export class WorkflowStartedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_STARTED

  /**
   *
   */
  private constructor(eventData: WorkflowStartedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowStartedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(
    eventData: WorkflowStartedEventData,
  ): Success<WorkflowStartedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowStartedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowStartedEvent(validData, idempotencyKey, new Date().toISOString())
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
  private static generateIdempotencyKey(eventData: WorkflowStartedEventData): string {
    return `workflowId:${eventData.workflowId}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: WorkflowStartedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowStartedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowStartedEvent.reconstitute'
    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new WorkflowStartedEvent(validEvent.eventData, idempotencyKey, createdAt)
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
const _ConstructorCheck: EventStoreEventConstructor = WorkflowStartedEvent
