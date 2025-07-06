import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase } from './EventStoreEventBase'

/**
 *
 */
const schema = z.object({
  workflowId: z.string().trim().min(6),
  started: z.literal(true),
})

export type WorkflowStartedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowStartedEvent extends EventStoreEventBase {
  public static readonly eventName = 'WORKFLOW_STARTED'
  /**
   *
   */
  constructor(eventData: WorkflowStartedEventData, idempotencyKey: string) {
    super(WorkflowStartedEvent.eventName, eventData, idempotencyKey, new Date().toISOString())
  }

  /**
   *
   */
  static fromData(data: WorkflowStartedEventData): Success<WorkflowStartedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowStartedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowStartedEvent(validData, idempotencyKey)
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
