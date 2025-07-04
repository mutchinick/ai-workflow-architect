import { EventStoreEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'

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
