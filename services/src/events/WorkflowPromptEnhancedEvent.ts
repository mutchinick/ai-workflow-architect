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
  agentId: z.string().trim().min(6),
  round: z.number().int().min(0),
})

export type WorkflowPromptEnhancedEventData = z.infer<typeof dataSchema>

const eventSchema = z.object({
  eventData: dataSchema,
  idempotencyKey: z.string().trim().min(6),
  createdAt: z.string().datetime(),
})

/**
 *
 */
export class WorkflowPromptEnhancedEvent extends EventStoreEvent<WorkflowPromptEnhancedEventData> {
  public static readonly eventName = EventStoreEventName.WORKFLOW_PROMPT_ENHANCED_EVENT

  /**
   *
   */
  private constructor(eventData: WorkflowPromptEnhancedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowPromptEnhancedEvent.eventName, eventData, idempotencyKey, createdAt)
  }

  /**
   *
   */
  static fromData(
    eventData: WorkflowPromptEnhancedEventData,
  ): Success<WorkflowPromptEnhancedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowPromptEnhancedEvent.fromData'

    try {
      const validData = dataSchema.parse(eventData)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowPromptEnhancedEvent(validData, idempotencyKey, new Date().toISOString())
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
  private static generateIdempotencyKey(eventData: WorkflowPromptEnhancedEventData): string {
    return `workflowId:${eventData.workflowId}:objectKey:${eventData.objectKey}`
  }

  /**
   *
   */
  static reconstitute(
    eventData: WorkflowPromptEnhancedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowPromptEnhancedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowPromptEnhancedEvent.reconstitute'
    try {
      const validEvent = eventSchema.parse({ eventData, idempotencyKey, createdAt })
      const event = new WorkflowPromptEnhancedEvent(validEvent.eventData, idempotencyKey, createdAt)
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
const _ConstructorCheck: EventStoreEventConstructor = WorkflowPromptEnhancedEvent
