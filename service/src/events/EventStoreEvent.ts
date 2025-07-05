import { EventStoreEventDefinition } from './EventStoreEventDefinition'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowAgentsDeployedEventDefinition } from './WorkflowAgentsDeployedEvent'
import { WorkflowCreatedEventDefinition } from './WorkflowCreatedEvent'
import { WorkflowPromptCompletedEventDefinition } from './WorkflowPromptCompletedEvent'
import { WorkflowPromptEnhancedEventDefinition } from './WorkflowPromptEnhancedEvent'

/**
 *
 */
const eventDefinitions = {
  [EventStoreEventName.WORKFLOW_CREATED]: WorkflowCreatedEventDefinition,
  [EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED]: WorkflowAgentsDeployedEventDefinition,
  [EventStoreEventName.WORKFLOW_PROMPT_ENHANCED]: WorkflowPromptEnhancedEventDefinition,
  [EventStoreEventName.WORKFLOW_PROMPT_COMPLETED]: WorkflowPromptCompletedEventDefinition,
}

type DataType<T> = T extends EventStoreEventDefinition<infer D> ? D : never

export type EventDataMap = {
  [K in EventStoreEventName]: DataType<(typeof eventDefinitions)[K]>
}

/**
 *
 */
export class EventStoreEvent<TEventName extends EventStoreEventName> {
  public readonly idempotencyKey: string
  public readonly eventName: TEventName
  public readonly eventData: EventDataMap[TEventName]
  public readonly createdAt: string

  /**
   *
   */
  private constructor(idempotencyKey: string, eventName: TEventName, validatedData: EventDataMap[TEventName]) {
    this.idempotencyKey = idempotencyKey
    this.eventName = eventName
    this.eventData = validatedData
    this.createdAt = new Date().toISOString()
  }

  /**
   *
   */
  public static fromData<T extends EventStoreEventName>(eventName: T, eventData: EventDataMap[T]): EventStoreEvent<T> {
    const definition = eventDefinitions[eventName]
    const validatedData = definition.parseValidate(eventData) as EventDataMap[T]
    const idempotencyKey = definition.generateIdempotencyKey(validatedData as never)
    return new EventStoreEvent(idempotencyKey, eventName, validatedData)
  }

  /**
   *
   */
  public static fromEventBridge<T extends EventStoreEventName>(payload: {
    eventName: string
    eventData: unknown
  }): EventStoreEvent<T> {
    const eventName = payload.eventName as T
    const definition = eventDefinitions[eventName]
    const validatedData = definition.parseValidate(payload.eventData) as EventDataMap[T]
    const idempotencyKey = definition.generateIdempotencyKey(validatedData as never)
    return new EventStoreEvent(idempotencyKey, eventName, validatedData)
  }

  /**
   *
   */
  public isOfType<T extends TEventName>(eventName: T): this is EventStoreEvent<T> {
    return this.eventName === eventName
  }
}
