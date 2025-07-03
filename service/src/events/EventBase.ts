//
//
//
export enum EventStoreEventName {
  USER_QUERY_RECEIVED = 'USER_QUERY_RECEIVED',
  QUERY_ENRICHED = 'QUERY_ENRICHED',
  ENRICHED_QUERY_GRADED = 'ENRICHED_QUERY_GRADED',
  QUERY_RESPONDED = 'QUERY_RESPONDED',
}

//
//
//
export type UserQueryReceivedData = {
  query: string
}

export type QueryEnrichedData = {
  query: string
  context: string
}

export type EnrichedQueryGradedData = {
  query: string
  grade: 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0
  reason: string
}

export type QueryRespondedData = {
  query: string
  context: string
  response: string
}

//
//
//
type EventStoreEventData = Record<string, unknown>

type EventDataMapping<T extends Record<EventStoreEventName, EventStoreEventData>> = T

export type EventDataMap = EventDataMapping<{
  [EventStoreEventName.USER_QUERY_RECEIVED]: UserQueryReceivedData
  [EventStoreEventName.QUERY_ENRICHED]: QueryEnrichedData
  [EventStoreEventName.ENRICHED_QUERY_GRADED]: EnrichedQueryGradedData
  [EventStoreEventName.QUERY_RESPONDED]: QueryRespondedData
}>

//
//
//
export class EventStoreEvent<TEventName extends EventStoreEventName> {
  public readonly idempotencyKey: string
  public readonly eventName: TEventName
  public readonly eventData: EventDataMap[TEventName]
  public readonly createdAt: string
  public readonly updatedAt: string

  constructor(
    idempotencyKey: string,
    eventName: TEventName,
    eventData: EventDataMap[TEventName],
    createdAt: string,
    updatedAt: string,
  ) {
    this.idempotencyKey = idempotencyKey
    this.eventName = eventName
    this.eventData = eventData
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  public static fromData<TEventName extends EventStoreEventName>(
    idempotencyKey: string,
    eventName: TEventName,
    eventData: EventDataMap[TEventName],
  ): EventStoreEvent<TEventName> {
    const now = new Date().toISOString()
    return new EventStoreEvent<TEventName>(idempotencyKey, eventName, eventData, now, now)
  }
}

//
//
//
const queryReceivedEvent = new EventStoreEvent(
  'key-123',
  EventStoreEventName.USER_QUERY_RECEIVED,
  {
    query: 'Why is the sky blue?',
  },
  new Date().toISOString(),
  new Date().toISOString(),
)

const queryGradedEvent = new EventStoreEvent(
  'key-456',
  EventStoreEventName.ENRICHED_QUERY_GRADED,
  {
    query: 'Why is the sky blue?',
    grade: 8,
    reason: 'The query is clear but could be more specific.',
  },
  new Date().toISOString(),
  new Date().toISOString(),
)
