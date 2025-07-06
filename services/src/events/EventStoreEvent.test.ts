import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventStoreEvent, IncomingEventBridgeEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowStartedEventData, WorkflowStartedEventDefinition } from './WorkflowStartedEvent'
import { Result } from './errors/Result'

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
    version: 'mockVersion',
    id: 'mockId',
    'detail-type': 'mockDetailType',
    source: 'mockSource',
    account: 'mockAccount',
    time: 'mocTime',
    region: 'mockRegion',
    resources: ['mockResource'],
    detail: {
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventID: 'mockEventId',
      eventVersion: 'mockEventVersion',
      awsRegion: 'mockAwsRegion',
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
        .mockReturnValue(`mockKey:${eventData.workflowId}`)

      const eventResult = EventStoreEvent.fromData(eventName, eventData)
      const event = Result.getSuccessValueOrThrow(eventResult)

      // Verify the spies were called correctly
      expect(parseValidateSpy).toHaveBeenCalledTimes(1)
      expect(parseValidateSpy).toHaveBeenCalledWith(eventData)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledTimes(1)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledWith(eventData)

      // Verify the created event instance has the correct properties
      expect(event).toBeInstanceOf(EventStoreEvent)
      expect(event.eventName).toBe(eventName)
      expect(event.eventData).toStrictEqual(eventData)
      expect(event.idempotencyKey).toBe(`mockKey:${eventData.workflowId}`)
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
        .mockReturnValue(`mockKey:${eventData.workflowId}`)

      const eventResult = EventStoreEvent.fromEventBridge(incomingEvent)
      const event = Result.getSuccessValueOrThrow(eventResult)

      // Verify external mocks and internal stubs
      expect(unmarshall).toHaveBeenCalledTimes(1)
      expect(unmarshall).toHaveBeenCalledWith(incomingEvent.detail.dynamodb.NewImage)
      expect(parseValidateSpy).toHaveBeenCalledWith(eventData)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledWith(eventData)

      // Verify the final event object is correct
      expect(event.eventName).toBe(eventName)
      expect(event.eventData).toStrictEqual(eventData)
      expect(event.idempotencyKey).toBe(`mockKey:${eventData.workflowId}`)
    })
  })

  /***
   * Test EventStoreEvent.isOfType
   */
  describe('Test EventStoreEvent.isOfType', () => {
    it('returns true and narrows type for the correct event name', () => {
      const eventData = buildFromDataInput()
      const eventResult = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_STARTED, eventData)
      const event = Result.getSuccessValueOrThrow(eventResult)
      expect(event.isOfType(EventStoreEventName.WORKFLOW_STARTED)).toBe(true)
      if (event.isOfType(EventStoreEventName.WORKFLOW_STARTED)) {
        expect(event.eventData.started).toBeDefined()
      }
    })

    it('returns false for an incorrect event name', () => {
      const eventData = buildFromDataInput()
      const eventResult = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_STARTED, eventData)
      const event = Result.getSuccessValueOrThrow(eventResult)
      expect(event.isOfType(EventStoreEventName.WORKFLOW_CONTINUED as never)).toBe(false)
    })
  })
})
