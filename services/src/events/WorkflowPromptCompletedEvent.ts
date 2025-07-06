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
})

/**
 *
 */
export type WorkflowPromptCompletedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowPromptCompletedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_PROMPT_COMPLETED

  /**
   *
   */
  constructor(eventData: WorkflowPromptCompletedEventData, idempotencyKey: string) {
    super(WorkflowPromptCompletedEvent.eventName, eventData, idempotencyKey, new Date().toISOString())
  }

  /**
   *
   */
  static fromData(
    data: WorkflowPromptCompletedEventData,
  ): Success<WorkflowPromptCompletedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowPromptCompletedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowPromptCompletedEvent(validData, idempotencyKey)
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
  private static parseValidate(data: unknown): WorkflowPromptCompletedEventData {
    return schema.parse(data)
  }

  /**
   *
   */
  private static generateIdempotencyKey(data: WorkflowPromptCompletedEventData): string {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  }
}
