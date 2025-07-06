import { EventStoreEventData } from './EventStoreEventData'
import { EventStoreEventName } from './EventStoreEventName'

export interface EventStoreEventDefinition<T extends EventStoreEventData> {
  __eventName: EventStoreEventName
  parseValidate: (data: unknown) => T
  generateIdempotencyKey: (data: T) => string
}
