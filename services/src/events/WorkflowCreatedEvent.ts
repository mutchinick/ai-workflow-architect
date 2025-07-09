import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase, EventStoreEventConstructor } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

/**
 *
 */
const dataSchema = z.object({
  workflowId: z.string().trim().min(6),
  objectKey: z.string().trim().min(6),
  promptEnhancementRounds: z.number().int().min(1).max(10),
  responseEnhancementRounds: z.number().int().min(1).max(10),
})

export type WorkflowCreatedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

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
  static fromData(
    eventData: WorkflowCreatedEventData,
  ): Success<WorkflowCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowCreatedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowCreatedEvent(validData, idempotencyKey, new Date().toISOString())
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
  private static generateIdempotencyKey(eventData: WorkflowCreatedEventData): string {
    return `workflowId:${eventData.workflowId}:objectKey:${eventData.objectKey}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: WorkflowCreatedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowCreatedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowCreatedEvent.reconstitute'
    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new WorkflowCreatedEvent(validEvent.eventData, idempotencyKey, createdAt)
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
const _ConstructorCheck: EventStoreEventConstructor = WorkflowCreatedEvent
