import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowCreatedEvent, WorkflowCreatedEventData } from './WorkflowCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-01-15T12:00:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockPromptEnhancementRounds = 3
const mockResponseEnhancementRounds = 5

/**
 *
 */
function buildTestInputData(): WorkflowCreatedEventData {
  return {
    workflowId: mockWorkflowId,
    promptEnhancementRounds: mockPromptEnhancementRounds,
    responseEnhancementRounds: mockResponseEnhancementRounds,
    objectKey: mockObjectKey,
  }
}

/**
 *
 */
describe(`Test WorkflowCreatedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEventData edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowCreatedEventData is valid`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowCreatedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData is undefined`, () => {
    const mockEventData = undefined as unknown as WorkflowCreatedEventData
    const result = WorkflowCreatedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData is null`, () => {
    const mockEventData = null as unknown as WorkflowCreatedEventData
    const result = WorkflowCreatedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEventData.workflowId edge cases
   ************************************************************/
  describe(`Test WorkflowCreatedEventData.workflowId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.workflowId has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '12345'
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEventData.promptEnhancementRounds edge cases
   ************************************************************/
  describe(`Test WorkflowCreatedEventData.promptEnhancementRounds`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.promptEnhancementRounds is less than 1`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.promptEnhancementRounds = 0
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.promptEnhancementRounds is greater than 10`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.promptEnhancementRounds = 11
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.promptEnhancementRounds is not an integer`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.promptEnhancementRounds = 3.14
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.promptEnhancementRounds is not a number`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.promptEnhancementRounds = '3' as never
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEventData.responseEnhancementRounds edge cases
   ************************************************************/
  describe(`Test WorkflowCreatedEventData.responseEnhancementRounds`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.responseEnhancementRounds is less than 1`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.responseEnhancementRounds = 0
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.responseEnhancementRounds is greater than 10`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.responseEnhancementRounds = 11
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.responseEnhancementRounds is not an integer`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.responseEnhancementRounds = 5.14
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.responseEnhancementRounds is not a number`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.responseEnhancementRounds = '5' as never
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEventData.objectKey edge cases
   ************************************************************/
  describe(`Test WorkflowCreatedEventData.objectKey`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.objectKey is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = undefined as never
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.objectKey is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = null as never
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.objectKey is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = ''
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.objectKey is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '      '
      const result = WorkflowCreatedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEventData.objectKey has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '12345'
      const result = WorkflowCreatedEvent.fromData(mockEventData)
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
  it(`returns the expected Success<WorkflowCreatedEvent> if the execution path is
      successful`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowCreatedEvent.fromData(mockEventData)

    const expectedIdempotencyKey = `workflowId:${mockEventData.workflowId}:objectKey:${mockEventData.objectKey}`
    const expectedEvent: WorkflowCreatedEvent = {
      idempotencyKey: expectedIdempotencyKey,
      eventName: EventStoreEventName.WORKFLOW_CREATED,
      eventData: {
        workflowId: mockEventData.workflowId,
        promptEnhancementRounds: mockEventData.promptEnhancementRounds,
        responseEnhancementRounds: mockEventData.responseEnhancementRounds,
        objectKey: mockEventData.objectKey,
      },
      createdAt: mockDate,
      fromData: undefined as never,
    }
    Object.setPrototypeOf(expectedEvent, WorkflowCreatedEvent.prototype)

    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
