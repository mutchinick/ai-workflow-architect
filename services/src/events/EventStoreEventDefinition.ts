import { EventStoreEventData } from './EventStoreEventData'

export interface EventStoreEventDefinition<T extends EventStoreEventData> {
  parseValidate: (data: unknown) => T
  generateIdempotencyKey: (data: T) => string
}
