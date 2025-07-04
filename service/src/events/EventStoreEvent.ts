import { EnrichedQueryGradedEvent, EnrichedQueryGradedEventData } from './EnrichedQueryGradedEvent'
import { EventStoreEventName } from './EventStoreEventName'
import { QueryEnrichedEvent, QueryEnrichedEventData } from './QueryEnrichedEvent'
import { QueryRespondedEvent, QueryRespondedEventData } from './QueryRespondedEvent'
import { UserQueryReceivedEvent, UserQueryReceivedEventData } from './UserQueryReceivedEvent'

//
//
//
const eventValidatorMap: Record<EventStoreEventName, (data: unknown) => EventStoreEventData> = {
  [EventStoreEventName.USER_QUERY_RECEIVED]: UserQueryReceivedEvent.parseValidatedData,
  [EventStoreEventName.QUERY_ENRICHED]: QueryEnrichedEvent.parseValidatedData,
  [EventStoreEventName.ENRICHED_QUERY_GRADED]: EnrichedQueryGradedEvent.parseValidatedData,
  [EventStoreEventName.QUERY_RESPONDED]: QueryRespondedEvent.parseValidatedData,
}

//
//
//
type EventStoreEventData = Record<string, unknown>

type EventDataRequiredMappings<T extends Record<EventStoreEventName, EventStoreEventData>> = T

export type EventDataMap = EventDataRequiredMappings<{
  [EventStoreEventName.USER_QUERY_RECEIVED]: UserQueryReceivedEventData
  [EventStoreEventName.QUERY_ENRICHED]: QueryEnrichedEventData
  [EventStoreEventName.ENRICHED_QUERY_GRADED]: EnrichedQueryGradedEventData
  [EventStoreEventName.QUERY_RESPONDED]: QueryRespondedEventData
}>

//
//
//
export class EventStoreEvent<TEventName extends EventStoreEventName> {
  public readonly idempotencyKey: string
  public readonly eventName: TEventName
  public readonly eventData: EventDataMap[TEventName]
  public readonly createdAt: string

  private constructor(idempotencyKey: string, eventName: TEventName, validatedData: EventDataMap[TEventName]) {
    this.idempotencyKey = idempotencyKey
    this.eventName = eventName
    this.eventData = validatedData
    this.createdAt = new Date().toISOString()
  }

  public static fromData<TEventName extends EventStoreEventName>(
    idempotencyKey: string,
    eventName: TEventName,
    eventData: EventDataMap[TEventName],
  ): EventStoreEvent<TEventName> {
    const validator = eventValidatorMap[eventName]
    if (!validator) {
      throw new Error(`Validation schema not found for event: ${eventName}`)
    }
    const validatedData = validator(eventData) as EventDataMap[TEventName]
    return new EventStoreEvent(idempotencyKey, eventName, validatedData)
  }
}
