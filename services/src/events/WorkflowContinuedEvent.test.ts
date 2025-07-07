import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowContinuedEvent, WorkflowContinuedEventData } from './WorkflowContinuedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-08-20T11:55:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'wf-continued-456'
const mockContinued = true

/**
 *
 */
function buildTestInputData(): WorkflowContinuedEventData {
  return {
    workflowId: mockWorkflowId,
    continued: mockContinued,
  }
}

/**
 *
 */
describe(`Test WorkflowContinuedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowContinuedEventData edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowContinuedEventData is valid`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowContinuedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData is undefined`, () => {
    const mockEventData = undefined as unknown as WorkflowContinuedEventData
    const result = WorkflowContinuedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData is null`, () => {
    const mockEventData = null as unknown as WorkflowContinuedEventData
    const result = WorkflowContinuedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowContinuedEventData.workflowId edge cases
   ************************************************************/
  describe(`Test WorkflowContinuedEventData.workflowId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowContinuedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowContinuedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowContinuedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowContinuedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowContinuedEventData.workflowId has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '12345'
      const result = WorkflowContinuedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowContinuedEventData.continued edge cases
   ************************************************************/
  describe(`Test WorkflowContinuedEventData.continued`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowContinuedEventData.continued is undefined`, () => {
      const mockWorkflowContinuedEventData = buildTestInputData()
      mockWorkflowContinuedEventData.continued = undefined as never
      const result = WorkflowContinuedEvent.fromData(mockWorkflowContinuedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowContinuedEventData.continued is null`, () => {
      const mockWorkflowContinuedEventData = buildTestInputData()
      mockWorkflowContinuedEventData.continued = null as never
      const result = WorkflowContinuedEvent.fromData(mockWorkflowContinuedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowContinuedEventData.continued is false`, () => {
      const mockWorkflowContinuedEventData = buildTestInputData()
      mockWorkflowContinuedEventData.continued = false as never
      const result = WorkflowContinuedEvent.fromData(mockWorkflowContinuedEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowContinuedEventData.continued is not a boolean`, () => {
      const mockWorkflowContinuedEventData = buildTestInputData()
      mockWorkflowContinuedEventData.continued = 'true' as never
      const result = WorkflowContinuedEvent.fromData(mockWorkflowContinuedEventData)
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
  it(`returns the expected Success<WorkflowContinuedEvent> if the execution path is
      successful`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowContinuedEvent.fromData(mockEventData)

    const expectedIdempotencyKey = `workflowId:${mockEventData.workflowId}:continued:${mockEventData.continued}`
    const expectedEvent: WorkflowContinuedEvent = {
      idempotencyKey: expectedIdempotencyKey,
      eventName: EventStoreEventName.WORKFLOW_CONTINUED,
      eventData: {
        workflowId: mockEventData.workflowId,
        continued: mockEventData.continued,
      },
      createdAt: mockDate,
      fromData: undefined as never,
    }
    Object.setPrototypeOf(expectedEvent, WorkflowContinuedEvent.prototype)

    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
