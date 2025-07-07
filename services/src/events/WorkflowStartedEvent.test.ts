import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowStartedEvent, WorkflowStartedEventData } from './WorkflowStartedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockStarted = true

function buildTestInputData(): WorkflowStartedEventData {
  return {
    workflowId: mockWorkflowId,
    started: mockStarted,
  }
}

describe(`Inventory Service RestockSkuApi WorkflowStartedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEventData edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowStartedEventData is valid`, () => {
    const mockWorkflowStartedEventData = buildTestInputData()
    const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData is undefined`, () => {
    const mockWorkflowStartedEventData = undefined as unknown as WorkflowStartedEventData
    const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData is null`, () => {
    const mockWorkflowStartedEventData = null as unknown as WorkflowStartedEventData
    const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEventData.workflowId edge cases
   ************************************************************/
  describe(`Test WorkflowStartedEventData.workflowId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.workflowId is undefined`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.workflowId = undefined as never
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.workflowId is null`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.workflowId = null as never
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.workflowId is empty`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.workflowId = ''
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.workflowId is blank`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.workflowId = '      '
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.workflowId length < 6`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.workflowId = '12345'
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEventData.started edge cases
   ************************************************************/
  describe(`Test WorkflowStartedEventData.started`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.started is undefined`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.started = undefined as never
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.started is null`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.started = null as never
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.started is false`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.started = false as never
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEventData.started is not a boolean`, () => {
      const mockWorkflowStartedEventData = buildTestInputData()
      mockWorkflowStartedEventData.started = 'true' as never
      const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<WorkflowStartedEvent> if the execution path is
      successful`, () => {
    const mockWorkflowStartedEventData = buildTestInputData()
    const result = WorkflowStartedEvent.fromData(mockWorkflowStartedEventData)

    const expectedIdempotencyKey = `workflow:${mockWorkflowStartedEventData.workflowId}`
    const expectedEvent: WorkflowStartedEvent = {
      idempotencyKey: expectedIdempotencyKey,
      eventName: EventStoreEventName.WORKFLOW_STARTED,
      eventData: {
        workflowId: mockWorkflowStartedEventData.workflowId,
        started: mockWorkflowStartedEventData.started,
      },
      createdAt: mockDate,
      fromData: undefined as never,
    }
    Object.setPrototypeOf(expectedEvent, WorkflowStartedEvent.prototype)

    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
