import { EventStoreEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'

//
// EventStoreEventName.USER_QUERY_RECEIVED
//
try {
  const event = EventStoreEvent.fromData(EventStoreEventName.USER_QUERY_RECEIVED, {
    workflowId: 'workflow-123',
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
  const event = EventStoreEvent.fromData(EventStoreEventName.QUERY_ENRICHED, {
    workflowId: 'workflow-123',
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
  const event = EventStoreEvent.fromData(EventStoreEventName.QUERY_RESPONDED, {
    workflowId: 'workflow-123',
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
  const event = EventStoreEvent.fromData(EventStoreEventName.ENRICHED_QUERY_GRADED, {
    workflowId: 'workflow-123',
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
