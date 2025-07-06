import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventStoreEvent, IncomingEventBridgeEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowStartedEventData, WorkflowStartedEventDefinition } from './WorkflowStartedEvent'

/**
 * Mock AWS DynamoDB unmarshall function
 */
jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: jest.fn(),
}))

/**
 * Helper function to build a mock input for WorkflowStartedEventData
 */
function buildFromDataInput(): WorkflowStartedEventData {
  return {
    workflowId: 'mockWorkflowId',
    started: true,
  }
}

/**
 * Helper function to build a mock input for IncomingEventBridgeEvent
 */
function buildEventBridgeInput(): IncomingEventBridgeEvent {
  return {
    version: '0',
    id: 'some-event-id',
    'detail-type': 'DynamoDB Stream Record',
    source: 'aws.dynamodb',
    account: '123456789012',
    time: new Date().toISOString(),
    region: 'us-east-1',
    resources: ['some-arn'],
    detail: {
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventID: 'some-stream-event-id',
      eventVersion: '1.1',
      awsRegion: 'us-east-1',
      dynamodb: {
        NewImage: {} as never,
      },
    },
  }
}

/***
 * Test EventStoreEvent
 */
describe('Test EventStoreEvent', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  /***
   * Test EventStoreEvent.fromData
   */
  describe('Test EventStoreEvent.fromData', () => {
    it('creates a valid event and calls the correct definition methods', () => {
      const eventName = EventStoreEventName.WORKFLOW_STARTED
      const eventData = buildFromDataInput()

      const parseValidateSpy = jest.spyOn(WorkflowStartedEventDefinition, 'parseValidate')
      const generateIdempotencyKeySpy = jest
        .spyOn(WorkflowStartedEventDefinition, 'generateIdempotencyKey')
        .mockReturnValue(`key-for:${eventData.workflowId}`)

      const event = EventStoreEvent.fromData(eventName, eventData)

      // Verify the spies were called correctly
      expect(parseValidateSpy).toHaveBeenCalledTimes(1)
      expect(parseValidateSpy).toHaveBeenCalledWith(eventData)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledTimes(1)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledWith(eventData)

      // Verify the created event instance has the correct properties
      expect(event).toBeInstanceOf(EventStoreEvent)
      expect(event.eventName).toBe(eventName)
      expect(event.eventData).toStrictEqual(eventData)
      expect(event.idempotencyKey).toBe(`key-for:${eventData.workflowId}`)
      expect(event.createdAt).toBeDefined()
    })
  })

  /***
   * Test EventStoreEvent.fromEventBridge
   */
  describe('Test EventStoreEvent.fromEventBridge', () => {
    it('creates a valid event from a DynamoDB stream payload', () => {
      const eventName = EventStoreEventName.WORKFLOW_STARTED
      const eventData = buildFromDataInput()
      const incomingEvent = buildEventBridgeInput()

      const mockUnmarshalledEvent = { eventName, eventData }
      ;(unmarshall as jest.Mock).mockReturnValue(mockUnmarshalledEvent)

      const parseValidateSpy = jest.spyOn(WorkflowStartedEventDefinition, 'parseValidate')
      const generateIdempotencyKeySpy = jest
        .spyOn(WorkflowStartedEventDefinition, 'generateIdempotencyKey')
        .mockReturnValue(`key-for:${eventData.workflowId}`)

      const event = EventStoreEvent.fromEventBridge(incomingEvent)

      // Verify external mocks and internal stubs
      expect(unmarshall).toHaveBeenCalledTimes(1)
      expect(unmarshall).toHaveBeenCalledWith(incomingEvent.detail.dynamodb.NewImage)
      expect(parseValidateSpy).toHaveBeenCalledWith(eventData)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledWith(eventData)

      // Verify the final event object is correct
      expect(event.eventName).toBe(eventName)
      expect(event.eventData).toStrictEqual(eventData)
      expect(event.idempotencyKey).toBe(`key-for:${eventData.workflowId}`)
    })
  })

  /***
   * Test EventStoreEvent.isOfType
   */
  describe('Test EventStoreEvent.isOfType', () => {
    it('returns true and narrows type for the correct event name', () => {
      const eventData = buildFromDataInput()
      const event = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_STARTED, eventData)
      expect(event.isOfType(EventStoreEventName.WORKFLOW_STARTED)).toBe(true)
      if (event.isOfType(EventStoreEventName.WORKFLOW_STARTED)) {
        expect(event.eventData.started).toBeDefined()
      }
    })

    it('returns false for an incorrect event name', () => {
      const eventData = buildFromDataInput()
      const event = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_STARTED, eventData)
      expect(event.isOfType(EventStoreEventName.WORKFLOW_CONTINUED as never)).toBe(false)
    })
  })
})
