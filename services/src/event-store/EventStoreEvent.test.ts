import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Result } from '../errors/Result'
import { WorkflowStartedEventData, WorkflowStartedEventDefinition } from '../events/WorkflowStartedEvent'
import { EventStoreEvent, IncomingEventBridgeEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'

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
describe(`Test EventStoreEvent`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  /***
   * Test EventStoreEvent.fromData
   */
  describe(`Test EventStoreEvent.fromData`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the event name
        is invalid`, () => {
      const eventName = 'mockEventName' as EventStoreEventName
      const eventData = buildFromDataInput()

      const parseValidateSpy = jest.spyOn(WorkflowStartedEventDefinition, 'parseValidate')
      const generateIdempotencyKeySpy = jest
        .spyOn(WorkflowStartedEventDefinition, 'generateIdempotencyKey')
        .mockReturnValue(`mockKey:${eventData.workflowId}`)

      const eventResult = EventStoreEvent.fromData(eventName, eventData)

      expect(parseValidateSpy).toHaveBeenCalledTimes(0)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledTimes(0)

      expect(Result.isFailure(eventResult)).toBe(true)
      expect(Result.isFailureOfKind(eventResult, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(eventResult)).toBe(false)
    })

    it(`creates a valid event and calls the correct definition methods`, () => {
      const eventName = EventStoreEventName.WORKFLOW_STARTED
      const eventData = buildFromDataInput()

      const parseValidateSpy = jest.spyOn(WorkflowStartedEventDefinition, 'parseValidate')
      const generateIdempotencyKeySpy = jest
        .spyOn(WorkflowStartedEventDefinition, 'generateIdempotencyKey')
        .mockReturnValue(`mockKey:${eventData.workflowId}`)

      const eventResult = EventStoreEvent.fromData(eventName, eventData)

      // Verify the spies were called correctly
      expect(parseValidateSpy).toHaveBeenCalledTimes(1)
      expect(parseValidateSpy).toHaveBeenCalledWith(eventData)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledTimes(1)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledWith(eventData)

      expect(Result.isSuccess(eventResult)).toBe(true)
      if (Result.isSuccess(eventResult)) {
        const event = eventResult.value
        expect(event).toBeInstanceOf(EventStoreEvent)
        expect(event.eventName).toBe(eventName)
        expect(event.eventData).toStrictEqual(eventData)
        expect(event.idempotencyKey).toBe(`mockKey:${eventData.workflowId}`)
        expect(event.createdAt).toBeDefined()
      }
    })
  })

  /***
   * Test EventStoreEvent.fromEventBridge
   */
  describe(`Test EventStoreEvent.fromEventBridge`, () => {
    it(`creates a valid event from a DynamoDB stream payload`, () => {
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

      // Verify external mocks and internal stubs
      expect(unmarshall).toHaveBeenCalledTimes(1)
      expect(unmarshall).toHaveBeenCalledWith(incomingEvent.detail.dynamodb.NewImage)
      expect(parseValidateSpy).toHaveBeenCalledWith(eventData)
      expect(generateIdempotencyKeySpy).toHaveBeenCalledWith(eventData)

      expect(Result.isSuccess(eventResult)).toBe(true)
      if (Result.isSuccess(eventResult)) {
        const event = eventResult.value
        expect(event).toBeInstanceOf(EventStoreEvent)
        expect(event.eventName).toBe(eventName)
        expect(event.eventData).toStrictEqual(eventData)
        expect(event.idempotencyKey).toBe(`mockKey:${eventData.workflowId}`)
        expect(event.createdAt).toBeDefined()
      }
    })
  })

  /***
   * Test EventStoreEvent.isOfType
   */
  describe(`Test EventStoreEvent.isOfType`, () => {
    it(`returns true and narrows type for the correct event name`, () => {
      const eventData = buildFromDataInput()
      const eventResult = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_STARTED, eventData)
      const event = Result.getSuccessValueOrThrow(eventResult)
      expect(EventStoreEvent.isOfType(event, EventStoreEventName.WORKFLOW_STARTED)).toBe(true)
      if (EventStoreEvent.isOfType(event, EventStoreEventName.WORKFLOW_STARTED)) {
        expect(event.eventData.started).toBeDefined()
      }
    })

    it(`returns false for an incorrect event name`, () => {
      const eventData = buildFromDataInput()
      const eventResult = EventStoreEvent.fromData(EventStoreEventName.WORKFLOW_STARTED, eventData)
      const event = Result.getSuccessValueOrThrow(eventResult)
      expect(EventStoreEvent.isOfType(event, EventStoreEventName.WORKFLOW_CONTINUED as never)).toBe(false)
    })
  })
})
