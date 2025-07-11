import { z } from 'zod'
import { Failure, Result, Success } from '../errors/Result'
import { EventStoreEvent, EventStoreEventConstructor } from '../event-store/EventStoreEvent'
import { EventStoreEventName } from '../event-store/EventStoreEventName'

/**
 *
 */
const dataSchema = z.object({
  workflowId: z.string().trim().min(6),
  objectKey: z.string().trim().min(6),
})

export type WorkflowPromptCompletedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

/**
 *
 */
export class WorkflowPromptCompletedEvent extends EventStoreEvent<WorkflowPromptCompletedEventData> {
  public static readonly eventName = EventStoreEventName.WORKFLOW_PROMPT_COMPLETED

  /**
   *
   */
  private constructor(eventData: WorkflowPromptCompletedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowPromptCompletedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(
    eventData: WorkflowPromptCompletedEventData,
  ): Success<WorkflowPromptCompletedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowPromptCompletedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowPromptCompletedEvent(validData, idempotencyKey, new Date().toISOString())
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
  private static generateIdempotencyKey(eventData: WorkflowPromptCompletedEventData): string {
    return `workflowId:${eventData.workflowId}:objectKey:${eventData.objectKey}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: WorkflowPromptCompletedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowPromptCompletedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowPromptCompletedEvent.reconstitute'
    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new WorkflowPromptCompletedEvent(validEvent.eventData, idempotencyKey, createdAt)
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
const _ConstructorCheck: EventStoreEventConstructor = WorkflowPromptCompletedEvent
