import { Result, Success } from '../errors/Result'
import { EventStoreEvent } from './EventStoreEvent'
import { EventClassMap, EventStoreEventBuilder, IncomingEventBridgeEvent } from './EventStoreEventBuilder'
import { EventStoreEventData } from './EventStoreEventData'
import { EventStoreEventName } from './EventStoreEventName'

const mockWorkflowId = 'mockWorkflowId'
const mockEventData = { workflowId: mockWorkflowId }
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockCreatedAt = new Date().toISOString()

/**
 *
 */
const MOCK_SOME_EVENT = 'MOCK_SOME_EVENT' as EventStoreEventName
class MockSomeEvent extends EventStoreEvent {
  public static readonly eventName = MOCK_SOME_EVENT
  private constructor(eventData: EventStoreEventData, idempotencyKey: string, createdAt: string) {
    super(MockSomeEvent.eventName, eventData, idempotencyKey, createdAt)
  }
  static reconstitute(
    eventData: EventStoreEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<MockSomeEvent> {
    return Result.makeSuccess(new MockSomeEvent(eventData, idempotencyKey, createdAt))
  }
}
const mockEventClassMap: EventClassMap = {
  [MOCK_SOME_EVENT]: MockSomeEvent,
}

/**
 *
 */
function buildEventBridgeInput(): IncomingEventBridgeEvent {
  return {
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: 'mockId',
    region: 'mockRegion',
    resources: ['mockResource'],
    source: 'mockSource',
    time: 'mockTime',
    version: 'mockVersion',
    detail: {
      awsRegion: 'mockAwsRegion',
      eventID: 'mockEventId',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventVersion: 'mockEventVersion',
      dynamodb: {
        NewImage: {
          eventName: { S: MOCK_SOME_EVENT },
          eventData: { M: { workflowId: { S: mockWorkflowId } } },
          idempotencyKey: { S: mockIdempotencyKey },
          createdAt: { S: mockCreatedAt },
        },
      },
    },
  }
}

/***
 * Test EventStoreEventBuilder
 */
describe(`Test EventStoreEventBuilder`, () => {
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
  describe(`Test EventStoreEventBuilder.fromEventBridge`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input event
        payload is undefined`, () => {
      const mockIncomingEvent = undefined as unknown as IncomingEventBridgeEvent
      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the
        EventBrideEvent event does not have an eventName`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      mockIncomingEvent.detail.dynamodb.NewImage['eventName']['S'] = undefined as unknown as string
      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if no matching
        event is found in eventClassMap`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      mockIncomingEvent.detail.dynamodb.NewImage['eventName']['S'] = 'UNKNOWN_EVENT'
      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`propagates the Failure if Event.reconstitute returns a failure`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      const message = 'SomeSpecificErrorMessage'
      const expectedFailure = Result.makeFailure('SomeSpecificError' as never, message, false)
      jest.spyOn(MockSomeEvent, 'reconstitute').mockReturnValueOnce(expectedFailure as never)
      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(result).toStrictEqual(expectedFailure)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls the matching Event.reconstitute a single time`, () => {
    const mockIncomingEvent = buildEventBridgeInput()
    const spy = jest.spyOn(MockSomeEvent, 'reconstitute')
    EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it(`calls the matching Event.reconstitute with the expected input`, () => {
    const mockIncomingEvent = buildEventBridgeInput()
    const spy = jest.spyOn(MockSomeEvent, 'reconstitute')
    EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
    expect(spy).toHaveBeenCalledWith(mockEventData, mockIdempotencyKey, mockCreatedAt)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<EventStoreEvent> if the execution path is
      successful`, () => {
    const mockIncomingEvent = buildEventBridgeInput()
    const eventResult = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
    const expectedEvent: MockSomeEvent = {
      eventName: MockSomeEvent.eventName,
      eventData: mockEventData,
      idempotencyKey: mockIdempotencyKey,
      createdAt: mockCreatedAt,
    }
    Object.setPrototypeOf(expectedEvent, MockSomeEvent.prototype)
    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(eventResult)).toBe(true)
    expect(eventResult).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<EventStoreEvent> where the event is an instance of
      the correct event class if the execution path is successful`, () => {
    const mockIncomingEvent = buildEventBridgeInput()
    const eventResult = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
    expect(Result.isSuccess(eventResult)).toBe(true)
    const event = Result.getSuccessValueOrThrow(eventResult)
    expect(event).toBeInstanceOf(MockSomeEvent)
  })
})
