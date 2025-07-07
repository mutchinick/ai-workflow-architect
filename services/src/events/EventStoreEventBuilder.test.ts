import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Result } from './errors/Result'
import { EventStoreEventBase } from './EventStoreEventBase'
import { EventClassMap, EventStoreEventBuilder, IncomingEventBridgeEvent } from './EventStoreEventBuilder'
import { EventStoreEventName } from './EventStoreEventName'

// --- Mocks & Stubs ---

// 1. Mock the external AWS dependency
jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: jest.fn(),
}))

// 2. Create mock Event Classes that conform to the required contracts
class MockWorkflowCreatedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_CREATED
  constructor() {
    super(MockWorkflowCreatedEvent.eventName, {}, 'mock-idempotency-key', new Date().toISOString())
  }
  // The static factory method is the key part of the contract
  static fromData = jest.fn()
}

class MockAgentsDeployedEvent extends EventStoreEventBase {
  public static readonly eventName = EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED
  constructor() {
    super(MockAgentsDeployedEvent.eventName, {}, 'mock-idempotency-key', new Date().toISOString())
  }
  static fromData = jest.fn()
}

// 3. Create the dependency map that will be injected into the builder
const mockEventClassMap: EventClassMap = {
  [EventStoreEventName.WORKFLOW_CREATED]: MockWorkflowCreatedEvent as unknown as EventStoreEventBase,
  [EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED]: MockAgentsDeployedEvent as unknown as EventStoreEventBase,
}

// --- Test Data Builders ---

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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      event payload is undefined`, () => {
      const mockIncomingEvent = undefined as unknown as IncomingEventBridgeEvent
      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if unmarshall throws`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      ;(unmarshall as jest.Mock).mockImplementation(() => {
        throw new Error('Unmarshall failed')
      })

      const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the unmarshalled
      event does not have an eventName`, () => {
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

    it(`returns the Failure produced by the specific event class's fromData method`, () => {
      const mockIncomingEvent = buildEventBridgeInput()
      const mockEventData = { workflowId: 'wf-123' }
      ;(unmarshall as jest.Mock).mockReturnValue({
        eventName: EventStoreEventName.WORKFLOW_CREATED,
        eventData: mockEventData,
      })

      // Configure the mock class's fromData to return a specific Failure
      const expectedFailure = Result.makeFailure('SomeSpecificError' as never, new Error(), false)
      MockWorkflowCreatedEvent.fromData.mockReturnValue(expectedFailure)

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
    const mockEventData = { workflowId: 'wf-123' }
    ;(unmarshall as jest.Mock).mockReturnValue({
      eventName: EventStoreEventName.WORKFLOW_CREATED,
      eventData: mockEventData,
    })

    // Configure the mock class's fromData to return a successful instance
    const mockEventInstance = new MockWorkflowCreatedEvent()
    const expectedSuccess = Result.makeSuccess(mockEventInstance)
    MockWorkflowCreatedEvent.fromData.mockReturnValue(expectedSuccess)

    const result = EventStoreEventBuilder.fromEventBridge(mockEventClassMap, mockIncomingEvent)

    // Verify the correct dependencies were called
    expect(unmarshall).toHaveBeenCalledWith(mockIncomingEvent.detail.dynamodb.NewImage)
    expect(MockWorkflowCreatedEvent.fromData).toHaveBeenCalledWith(mockEventData)

    // Verify the final result is the expected Success object
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedSuccess)
    if (Result.isSuccess(result)) {
      const event = result.value
      expect(event).toBeInstanceOf(MockWorkflowCreatedEvent)
      if (event instanceof MockWorkflowCreatedEvent) {
        expect(event.eventName).toBe(EventStoreEventName.WORKFLOW_CREATED)
        expect(event.eventData).toEqual(mockEventData)
        expect(event.idempotencyKey).toBe('mock-idempotency-key')
      }
    }
  })
})
