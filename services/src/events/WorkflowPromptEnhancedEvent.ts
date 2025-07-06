import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

/**
 *
 */
const schema = z.object({
  workflowId: z.string().trim().min(6),
  objectKey: z.string().trim().min(6),
  agentId: z.string().trim().min(6),
  round: z.number().int().min(0),
})

/**
 *
 */
export type WorkflowPromptEnhancedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowPromptEnhancedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_PROMPT_ENHANCED

  /**
   *
   */
  constructor(eventData: WorkflowPromptEnhancedEventData, idempotencyKey: string) {
    super(WorkflowPromptEnhancedEvent.eventName, eventData, idempotencyKey, new Date().toISOString())
  }

  /**
   *
   */
  static fromData(
    data: WorkflowPromptEnhancedEventData,
  ): Success<WorkflowPromptEnhancedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowPromptEnhancedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowPromptEnhancedEvent(validData, idempotencyKey)
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
  private static parseValidate(data: unknown): WorkflowPromptEnhancedEventData {
    return schema.parse(data)
  }

  /**
   *
   */
  private static generateIdempotencyKey(data: WorkflowPromptEnhancedEventData): string {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  }
}
