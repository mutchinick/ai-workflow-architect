import { z } from 'zod'

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
  context: string
  grade: 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0
}

export type QueryRespondedData = {
  query: string
  response: string
}

//
//
//
// --- 2. ZOD SCHEMAS FOR RUNTIME VALIDATION ---
const userQueryReceivedSchema = z.object({
  query: z.string().min(1),
})

const queryEnrichedSchema = z.object({
  query: z.string().min(1),
  context: z.string().min(1),
})

const enrichedQueryGradedSchema = z.object({
  query: z.string().min(1),
  grade: z.number().int().min(0).max(10),
})

const queryRespondedSchema = z.object({
  query: z.string().min(1),
  response: z.number().int().min(0).max(10),
})

const eventValidatorMap: Record<EventStoreEventName, z.ZodTypeAny> = {
  [EventStoreEventName.USER_QUERY_RECEIVED]: userQueryReceivedSchema,
  [EventStoreEventName.QUERY_ENRICHED]: queryEnrichedSchema,
  [EventStoreEventName.ENRICHED_QUERY_GRADED]: enrichedQueryGradedSchema,
  [EventStoreEventName.QUERY_RESPONDED]: queryRespondedSchema,
}

//
//
//
type EventStoreEventData = Record<string, unknown>

type EventDataRequiredMappings<T extends Record<EventStoreEventName, EventStoreEventData>> = T

export type EventDataMap = EventDataRequiredMappings<{
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

  private constructor(idempotencyKey: string, eventName: TEventName, validatedData: EventDataMap[TEventName]) {
    this.idempotencyKey = idempotencyKey
    this.eventName = eventName
    this.eventData = validatedData
    this.createdAt = new Date().toISOString()
  }

  public static fromData<T extends EventStoreEventName>(
    idempotencyKey: string,
    eventName: T,
    rawData: EventDataMap[T],
  ): EventStoreEvent<T> {
    const schema = eventValidatorMap[eventName]
    if (!schema) {
      throw new Error(`Validation schema not found for event: ${eventName}`)
    }
    const validatedData = schema.parse(rawData)
    return new EventStoreEvent(idempotencyKey, eventName, validatedData)
  }
}

//
// EventStoreEventName.USER_QUERY_RECEIVED
//
try {
  const event = EventStoreEvent.fromData('idempotency-key-123', EventStoreEventName.USER_QUERY_RECEIVED, {
    query: 'Why is the sky blue?',
  })
  console.log('Successfully created event:', event)
  console.log('Successfully created event with query:', event.eventData.query)
} catch (error) {
  console.error('This should not have failed:', error)
}

//
// EventStoreEventName.USER_QUERY_RECEIVED
//
try {
  const event = EventStoreEvent.fromData('idempotency-key-123', EventStoreEventName.QUERY_ENRICHED, {
    query: 'Why is the sky blue?',
    context: 'According to a well respected source it has to do with sunlight and atmospherical conditions.',
  })
  console.log('Successfully created event:', event)
  console.log('Successfully created event with query:', event.eventData.query)
  console.log('Successfully created event with context:', event.eventData.context)
} catch (error) {
  console.error('This should not have failed:', error)
}

//
// EventStoreEventName.USER_QUERY_RECEIVED
//
try {
  const event = EventStoreEvent.fromData('idempotency-key-123', EventStoreEventName.QUERY_RESPONDED, {
    query: 'Why is the sky blue?',
    response: 'The sky appears blue due to the scattering of sunlight by the atmosphere.',
  })
  console.log('Successfully created event:', event)
  console.log('Successfully created event with query:', event.eventData.query)
  console.log('Successfully created event with response:', event.eventData.response)
} catch (error) {
  console.error('This should not have failed:', error)
}

//
// EventStoreEventName.USER_QUERY_RECEIVED
//
try {
  const event = EventStoreEvent.fromData('idempotency-key-123', EventStoreEventName.ENRICHED_QUERY_GRADED, {
    query: 'Why is the sky blue?',
    context: 'According to a well respected source it has to do with sunlight and atmospherical conditions.',
    grade: 10,
  })
  console.log('Successfully created event:', event)
  console.log('Successfully created event with query:', event.eventData.query)
  console.log('Successfully created event with context:', event.eventData.context)
  console.log('Successfully created event with grade:', event.eventData.grade)
} catch (error) {
  console.error('This should not have failed:', error)
}
