import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase, EventStoreEventConstructor } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

/**
 *
 */
const schema = z.object({
  workflowId: z.string().trim().min(6),
  started: z.literal(true),
})

/**
 *
 */
export type WorkflowStartedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowStartedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_STARTED

  /**
   * Private constructor to enforce the use of factory methods.
   */
  private constructor(eventData: WorkflowStartedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowStartedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   * Factory for creating a BRAND NEW event.
   */
  static fromData(data: WorkflowStartedEventData): Success<WorkflowStartedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowStartedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      // Creates a new event with a fresh timestamp
      const event = new WorkflowStartedEvent(validData, idempotencyKey, new Date().toISOString())
      const eventResult = Result.makeSuccess(event)
      console.info(`${logCtx} exit success:`, { eventResult, data })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, data })
      return failure
    }
  }

  /**
   * Factory for RE-CREATING an event from stored data (e.g., from EventBridge).
   */
  static reconstitute(
    data: WorkflowStartedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowStartedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowStartedEvent.reconstitute'
    try {
      if (!idempotencyKey) {
        throw new Error('undefined or null idempotencyKey')
      }

      if (!createdAt) {
        throw new Error('undefined or null createdAt')
      }

      const validData = this.parseValidate(data)
      const event = new WorkflowStartedEvent(validData, idempotencyKey, createdAt)
      const eventResult = Result.makeSuccess(event)
      console.info(`${logCtx} exit success:`, { eventResult, data })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, data })
      return failure
    }
  }

  /**
   *
   */
  private static parseValidate(data: unknown): WorkflowStartedEventData {
    return schema.parse(data)
  }

  /**
   *
   */
  private static generateIdempotencyKey(data: WorkflowStartedEventData): string {
    return `workflow:${data.workflowId}`
  }
}

/**
 * This check ensures the class adheres to the static contract defined
 * by EventStoreEventConstructor. It will cause a compile-time error if
 * fromData or reconstitute are missing or have the wrong signature.
 */
const _ConstructorCheck: EventStoreEventConstructor = WorkflowStartedEvent
