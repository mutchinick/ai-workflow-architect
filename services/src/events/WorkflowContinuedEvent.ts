import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

/**
 *
 */
const schema = z.object({
  workflowId: z.string().trim().min(6),
  continued: z.literal(true),
})

/**
 *
 */
export type WorkflowContinuedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowContinuedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_CONTINUED

  /**
   *
   */
  constructor(eventData: WorkflowContinuedEventData, idempotencyKey: string) {
    super(WorkflowContinuedEvent.eventName, eventData, idempotencyKey, new Date().toISOString())
  }

  /**
   *
   */
  static fromData(
    data: WorkflowContinuedEventData,
  ): Success<WorkflowContinuedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowContinuedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowContinuedEvent(validData, idempotencyKey)
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
  private static parseValidate(data: unknown): WorkflowContinuedEventData {
    return schema.parse(data)
  }

  /**
   *
   */
  private static generateIdempotencyKey(data: WorkflowContinuedEventData): string {
    return `workflowId:${data.workflowId}:continued:${data.continued}`
  }
}
