import { EventStoreEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'

//
// WORKFLOW_CREATED
//
{
  const event = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_CREATED, {
    workflowId: 'workflow-123',
    eventKey: 'asdf-1234-created',
  })

  console.log(event.idempotencyKey)
  console.log(event.eventData.workflowId)
  console.log(event.eventData.eventKey)
}

//
// WORKFLOW_CREATED
//
{
  const event = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED, {
    workflowId: 'workflow-123',
    eventKey: 'asdf-2345-agents-deployed',
  })

  console.log(event.idempotencyKey)
  console.log(event.eventData.workflowId)
  console.log(event.eventData.eventKey)
}

//
// Event Bridge UNKNOWN_EVENT
//
{
  const event = EventStoreEvent.fromEventBridge({
    eventName: 'UNKNOWN_EVENT',
    eventData: {
      workflowId: 'workflow-123',
      query: 'What is AI?',
      response: 'AI is the simulation of human intelligence processes by machines.',
    },
  })

  console.log(event.idempotencyKey)
  console.log(event.eventData.workflowId)
  console.log(event.eventData.eventKey)
  if (event.isOfType(EventStoreEventName.WORKFLOW_PROMPT_ENHANCED)) {
    console.log(event.eventData.agentId)
    console.log(event.eventData.round)
  }
}
