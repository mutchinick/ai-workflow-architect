import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowPromptEnhancedEvent, WorkflowPromptEnhancedEventData } from './WorkflowPromptEnhancedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-07-06T19:08:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockAgentId = 'mockAgentId'
const mockRound = 1

function buildTestInputData(): WorkflowPromptEnhancedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
    agentId: mockAgentId,
    round: mockRound,
  }
}

describe(`Test WorkflowPromptEnhancedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptEnhancedEventData edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowPromptEnhancedEventData is valid`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData is undefined`, () => {
    const mockEventData = undefined as unknown as WorkflowPromptEnhancedEventData
    const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData is null`, () => {
    const mockEventData = null as unknown as WorkflowPromptEnhancedEventData
    const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptEnhancedEventData.workflowId edge cases
   ************************************************************/
  describe(`Test WorkflowPromptEnhancedEventData.workflowId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.workflowId length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '12345'
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptEnhancedEventData.objectKey edge cases
   ************************************************************/
  describe(`Test WorkflowPromptEnhancedEventData.objectKey`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.objectKey is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = undefined as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.objectKey is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = null as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.objectKey is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = ''
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.objectKey is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '      '
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.objectKey length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '12345'
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptEnhancedEventData.agentId edge cases
   ************************************************************/
  describe(`Test WorkflowPromptEnhancedEventData.agentId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.agentId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.agentId = undefined as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.agentId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.agentId = null as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.agentId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.agentId = ''
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.agentId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.agentId = '      '
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.agentId length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.agentId = '12345'
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptEnhancedEventData.round edge cases
   ************************************************************/
  describe(`Test WorkflowPromptEnhancedEventData.round`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.round is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.round = undefined as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.round is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.round = null as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.round is less than 0`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.round = -1
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.round is not an integer`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.round = 1.5
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowPromptEnhancedEventData.round is not a number`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.round = '2' as never
      const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)
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
  it(`returns the expected Success<WorkflowPromptEnhancedEvent> if the execution path is
      successful`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowPromptEnhancedEvent.fromData(mockEventData)

    const expectedIdempotencyKey = `workflowId:${mockEventData.workflowId}:objectKey:${mockEventData.objectKey}`
    const expectedEvent: WorkflowPromptEnhancedEvent = {
      idempotencyKey: expectedIdempotencyKey,
      eventName: EventStoreEventName.WORKFLOW_PROMPT_ENHANCED,
      eventData: {
        workflowId: mockEventData.workflowId,
        objectKey: mockEventData.objectKey,
        agentId: mockEventData.agentId,
        round: mockEventData.round,
      },
      createdAt: mockDate,
    }
    Object.setPrototypeOf(expectedEvent, WorkflowPromptEnhancedEvent.prototype)

    const expectedResult = Result.makeSuccess(expectedEvent)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
