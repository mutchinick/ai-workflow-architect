import z from 'zod'
import { EnrichedQueryGradedEventDefinition } from './EnrichedQueryGradedEvent'
import { EventStoreEventName } from './EventStoreEventName'
import { QueryEnrichedEventDefinition } from './QueryEnrichedEvent'
import { QueryRespondedEventDefinition } from './QueryRespondedEvent'
import { UserQueryReceivedEventDefinition } from './UserQueryReceivedEvent'

const eventDefinitions = {
  [EventStoreEventName.USER_QUERY_RECEIVED]: UserQueryReceivedEventDefinition,
  [EventStoreEventName.QUERY_ENRICHED]: QueryEnrichedEventDefinition,
  [EventStoreEventName.ENRICHED_QUERY_GRADED]: EnrichedQueryGradedEventDefinition,
  [EventStoreEventName.QUERY_RESPONDED]: QueryRespondedEventDefinition,
}

type AnyEventDefinition = (typeof eventDefinitions)[keyof typeof eventDefinitions]

const eventDefinitionMap = eventDefinitions satisfies Record<EventStoreEventName, AnyEventDefinition>

export type EventDataMap = {
  [K in EventStoreEventName]: z.infer<(typeof eventDefinitionMap)[K]['schema']>
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
    const definition = eventDefinitionMap[eventName]
    const validatedData = definition.schema.parse(eventData) as EventDataMap[T]
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
    const definition = eventDefinitionMap[eventName]

    if (!definition) {
      throw new Error(`Unknown event name from event bridge: ${eventName}`)
    }

    const validatedData = definition.schema.parse(payload.eventData) as EventDataMap[T]
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

//
// USER_QUERY_RECEIVED
//
{
  const event = EventStoreEvent.fromData(EventStoreEventName.USER_QUERY_RECEIVED, {
    query: 'What is AI?',
    workflowId: 'workflow-123',
  })

  console.log(event.idempotencyKey)
  console.log(event.eventData.workflowId)
}

//
// USER_QUERY_RECEIVED
//
{
  const event = EventStoreEvent.fromData(EventStoreEventName.ENRICHED_QUERY_GRADED, {
    query: 'What is AI?',
    workflowId: 'workflow-123',
    grade: 5,
    context: 'What is AI? (contextualized)',
  })

  console.log(event.idempotencyKey)
  console.log(event.eventData.workflowId)
  console.log(event.eventData.grade)
}

//
// Event Bridge Example
//
{
  const event = EventStoreEvent.fromEventBridge({
    eventName: 'UNKNOWN_EVENT_AT_THIS_POINT',
    eventData: {
      workflowId: 'workflow-123',
      query: 'What is AI?',
      response: 'AI is the simulation of human intelligence processes by machines.',
    },
  })

  console.log(event.idempotencyKey)
  console.log(event.eventData.workflowId)
  console.log(event.eventData.query)
  if (event.isOfType(EventStoreEventName.QUERY_RESPONDED)) {
    console.log(event.eventData.response)
  }
}
