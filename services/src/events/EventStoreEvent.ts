import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { EventStoreEventDefinition } from './EventStoreEventDefinition'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowAgentsDeployedEventDefinition } from './WorkflowAgentsDeployedEvent'
import { WorkflowContinuedEventDefinition } from './WorkflowContinuedEvent'
import { WorkflowCreatedEventDefinition } from './WorkflowCreatedEvent'
import { WorkflowPromptCompletedEventDefinition } from './WorkflowPromptCompletedEvent'
import { WorkflowPromptEnhancedEventDefinition } from './WorkflowPromptEnhancedEvent'
import { WorkflowStartedEventDefinition } from './WorkflowStartedEvent'

/**
 *
 */
type EventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

export type IncomingEventBridgeEvent = EventBridgeEvent<string, EventDetail>

/**
 *
 */
const eventDefinitions = {
  [EventStoreEventName.WORKFLOW_STARTED]: WorkflowStartedEventDefinition,
  [EventStoreEventName.WORKFLOW_CONTINUED]: WorkflowContinuedEventDefinition,
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
  public static fromEventBridge<T extends EventStoreEventName>(incoming: IncomingEventBridgeEvent): EventStoreEvent<T> {
    const eventDetail = incoming.detail
    const event = unmarshall(eventDetail.dynamodb.NewImage) as EventStoreEvent<T>
    const eventName = event.eventName
    const definition = eventDefinitions[eventName]
    const validatedData = definition.parseValidate(event.eventData) as EventDataMap[T]
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
