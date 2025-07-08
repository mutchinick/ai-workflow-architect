import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase, EventStoreEventConstructor } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

/**
 *
 */
const schema = z.object({
  workflowId: z.string().trim().min(6),
  promptEnhancementRounds: z.number().int().min(1).max(10),
  responseEnhancementRounds: z.number().int().min(1).max(10),
  objectKey: z.string().trim().min(6),
})

/**
 *
 */
export type WorkflowCreatedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowCreatedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_CREATED

  /**
   *
   */
  private constructor(eventData: WorkflowCreatedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowCreatedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(data: WorkflowCreatedEventData): Success<WorkflowCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowCreatedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowCreatedEvent(validData, idempotencyKey, new Date().toISOString())
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
  static reconstitute(
    data: WorkflowCreatedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowCreatedEvent.reconstitute'
    try {
      const validData = this.parseValidate(data)
      const event = new WorkflowCreatedEvent(validData, idempotencyKey, createdAt)
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
  private static parseValidate(data: unknown): WorkflowCreatedEventData {
    return schema.parse(data)
  }

  /**
   *
   */
  private static generateIdempotencyKey(data: WorkflowCreatedEventData): string {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  }
}

/**
 * This check ensures the class adheres to the static contract defined
 * by EventStoreEventConstructor. It will cause a compile-time error if
 * fromData or reconstitute are missing or have the wrong signature.
 */
const _ConstructorCheck: EventStoreEventConstructor = WorkflowCreatedEvent
