import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Result, Success } from './errors/Result'
import { EventStoreEventBase } from './EventStoreEventBase'
import { EventClassMap, EventStoreEventBuilder, IncomingEventBridgeEvent } from './EventStoreEventBuilder'
import { EventStoreEventName } from './EventStoreEventName'

jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: jest.fn(),
}))

/**
 *
 */
const MOCK_SOME_EVENT = 'MOCK_SOME_EVENT' as EventStoreEventName
class MockSomeEvent extends EventStoreEventBase {
  public static readonly eventName = MOCK_SOME_EVENT
  private constructor(data: Record<string, unknown>, idempotencyKey: string, createdAt: string) {
    super(MockSomeEvent.eventName, data, idempotencyKey, createdAt)
  }
  static fromData(data: Record<string, unknown>): Success<MockSomeEvent> {
    return Result.makeSuccess(new MockSomeEvent(data, 'mockIdempotencyKey', new Date().toISOString()))
  }
  static reconstitute(
    data: Record<string, unknown>,
    idempotencyKey: string,
    createdAt: string,
  ): Success<MockSomeEvent> {
    return Result.makeSuccess(new MockSomeEvent(data, idempotencyKey, createdAt))
  }
}

const MOCK_OTHER_EVENT = 'MOCK_OTHER_EVENT' as EventStoreEventName
class MockOtherEvent extends EventStoreEventBase {
  public static readonly eventName = MOCK_SOME_EVENT
  private constructor(data: Record<string, unknown>, idempotencyKey: string, createdAt: string) {
    super(MockSomeEvent.eventName, data, idempotencyKey, createdAt)
  }
  static fromData(data: Record<string, unknown>): Success<MockSomeEvent> {
    return Result.makeSuccess(new MockOtherEvent(data, 'mockIdempotencyKey', new Date().toISOString()))
  }
  static reconstitute(
    data: Record<string, unknown>,
    idempotencyKey: string,
    createdAt: string,
  ): Success<MockSomeEvent> {
    return Result.makeSuccess(new MockOtherEvent(data, idempotencyKey, createdAt))
  }
}

const mockEventClassMap: EventClassMap = {
  [MOCK_SOME_EVENT]: MockSomeEvent,
  [MOCK_OTHER_EVENT]: MockOtherEvent,
}

/**
 *
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
 * Test EventStoreEventBuilder
 */
describe('Test EventStoreEventBuilder', () => {
  // Clear all mock history before each test for isolation
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test EventStoreEventBuilder.fromEventBridge edge cases
   ************************************************************/
  describe('Test EventStoreEventBuilder.fromEventBridge', () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input event
        payload is undefined`, () => {
      const mockIncomingEvent = undefined as unknown as IncomingEventBridgeEvent
      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if unmarshall
        throws`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      ;(unmarshall as jest.Mock).mockImplementation(() => {
        throw new Error('Unmarshall failed')
      })

      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the
        unmarshalled event does not have an eventName`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      // Simulate unmarshall returning an object without an eventName
      ;(unmarshall as jest.Mock).mockReturnValue({ eventData: { some: 'data' } })

      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the eventName
        is not found in the eventClassMap`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      // Simulate unmarshall returning an object with an unknown eventName
      ;(unmarshall as jest.Mock).mockReturnValue({
        eventName: 'SOME_UNKNOWN_EVENT',
        eventData: { some: 'data' },
      })

      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns the Failure produced by the specific event class's reconstitute method`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      const mockEventData = { workflowId: 'mockWorkflowId' }
      const mockIdempotencyKey = 'mockIdempotencyKey'
      const mockCreatedAt = new Date().toISOString()

      ;(unmarshall as jest.Mock).mockReturnValue({
        eventName: MOCK_OTHER_EVENT,
        eventData: mockEventData,
        idempotencyKey: mockIdempotencyKey,
        createdAt: mockCreatedAt,
      })

      // Configure the mock class's reconstitute to return a specific Failure
      const expectedFailure = Result.makeFailure('SomeSpecificError' as never, new Error(), false)
      jest.spyOn(MockOtherEvent, 'reconstitute').mockReturnValueOnce(expectedFailure as never)

      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)

      // Assert that the builder passed through the failure correctly
      expect(result).toStrictEqual(expectedFailure)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<EventStoreEventBase> if the execution path is
      successful`, () => {
    const mockIncomingEvent = buildEventBridgeInput()
    const mockEventData = { workflowId: 'mockWorkflowId' }
    const mockIdempotencyKey = 'mockIdempotencyKey'
    const mockCreatedAt = new Date().toISOString()

    ;(unmarshall as jest.Mock).mockReturnValue({
      eventName: MOCK_SOME_EVENT,
      eventData: mockEventData,
      idempotencyKey: mockIdempotencyKey,
      createdAt: mockCreatedAt,
    })

    const spy = jest.spyOn(MockSomeEvent, 'reconstitute')

    const eventResult = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
    expect(unmarshall).toHaveBeenCalledWith(mockIncomingEvent.detail.dynamodb.NewImage)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockEventData, mockIdempotencyKey, mockCreatedAt)

    // Verify the final result is the expected Success object
    const expectedEvent = MockSomeEvent.reconstitute(mockEventData, mockIdempotencyKey, mockCreatedAt)
    expect(Result.isSuccess(eventResult)).toBe(true)
    expect(eventResult).toStrictEqual(expectedEvent)
    if (Result.isSuccess(eventResult)) {
      const event = eventResult.value
      expect(event).toBeInstanceOf(MockSomeEvent)
      if (event instanceof MockSomeEvent) {
        expect(event.eventName).toBe(MOCK_SOME_EVENT)
        expect(event.eventData).toStrictEqual(mockEventData)
        expect(event.idempotencyKey).toBe('mockIdempotencyKey')
      }
    }
  })
})
