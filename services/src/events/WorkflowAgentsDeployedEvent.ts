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
export type WorkflowAgentsDeployedEventData = z.infer<typeof schema>

/**
 *
 */
export class WorkflowAgentsDeployedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED

  /**
   *
   */
  constructor(eventData: WorkflowAgentsDeployedEventData, idempotencyKey: string) {
    super(WorkflowAgentsDeployedEvent.eventName, eventData, idempotencyKey, new Date().toISOString())
  }

  /**
   *
   */
  static fromData(
    data: WorkflowAgentsDeployedEventData,
  ): Success<WorkflowAgentsDeployedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowAgentsDeployedEvent.fromData'

    try {
      const validData = this.parseValidate(data)
      const idempotencyKey = this.generateIdempotencyKey(validData)
      const event = new WorkflowAgentsDeployedEvent(validData, idempotencyKey)
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
  private static parseValidate(data: unknown): WorkflowAgentsDeployedEventData {
    return schema.parse(data)
  }

  /**
   *
   */
  private static generateIdempotencyKey(data: WorkflowAgentsDeployedEventData): string {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  }
}
