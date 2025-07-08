import { z } from 'zod'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase, EventStoreEventConstructor } from './EventStoreEventBase'
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
  private constructor(eventData: WorkflowAgentsDeployedEventData, idempotencyKey: string, createdAt: string) {
    super(WorkflowAgentsDeployedEvent.eventName, eventData, idempotencyKey, createdAt)
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
      const event = new WorkflowAgentsDeployedEvent(validData, idempotencyKey, new Date().toISOString())
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
    data: WorkflowAgentsDeployedEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<WorkflowAgentsDeployedEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'WorkflowAgentsDeployedEvent.reconstitute'
    try {
      const validData = this.parseValidate(data)
      const event = new WorkflowAgentsDeployedEvent(validData, idempotencyKey, createdAt)
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

/**
 * This check ensures the class adheres to the static contract defined
 * by EventStoreEventConstructor. It will cause a compile-time error if
 * fromData or reconstitute are missing or have the wrong signature.
 */
const _ConstructorCheck: EventStoreEventConstructor = WorkflowAgentsDeployedEvent
