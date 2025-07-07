import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowPromptCompletedEvent, WorkflowPromptCompletedEventData } from './WorkflowPromptCompletedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-07-07T10:30:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'

/**
 *
 */
function buildTestInputData(): WorkflowPromptCompletedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
  }
}

/**
 *
 */
describe(`Test WorkflowPromptCompletedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptCompletedEventData edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowPromptCompletedEventData is valid`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData is undefined`, () => {
    const mockEventData = undefined as unknown as WorkflowPromptCompletedEventData
    const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData is null`, () => {
    const mockEventData = null as unknown as WorkflowPromptCompletedEventData
    const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptCompletedEventData.workflowId edge cases
   ************************************************************/
  describe(`Test WorkflowPromptCompletedEventData.workflowId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.workflowId has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '12345'
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptCompletedEventData.objectKey edge cases
   ************************************************************/
  describe(`Test WorkflowPromptCompletedEventData.objectKey`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.objectKey is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = undefined as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.objectKey is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = null as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.objectKey is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = ''
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.objectKey is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '      '
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptCompletedEventData.objectKey has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '12345'
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
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
  it(`returns the expected Success<WorkflowPromptCompletedEvent> if the execution path is
      successful`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowPromptCompletedEvent.fromData(mockEventData)

    const expectedIdempotencyKey = `workflowId:${mockEventData.workflowId}:objectKey:${mockEventData.objectKey}`
    const expectedEvent: WorkflowPromptCompletedEvent = {
      idempotencyKey: expectedIdempotencyKey,
      eventName: EventStoreEventName.WORKFLOW_PROMPT_COMPLETED,
      eventData: {
        workflowId: mockEventData.workflowId,
        objectKey: mockEventData.objectKey,
      },
      createdAt: mockDate,
      fromData: undefined as never,
    }
    Object.setPrototypeOf(expectedEvent, WorkflowPromptCompletedEvent.prototype)

    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
