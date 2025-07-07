import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowAgentsDeployedEvent, WorkflowAgentsDeployedEventData } from './WorkflowAgentsDeployedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-09-10T15:45:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'wf-deployed-abc'
const mockObjectKey = 'agents/deployment-manifest.json'

/**
 *
 */
function buildTestInputData(): WorkflowAgentsDeployedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
  }
}

/**
 *
 */
describe(`Test WorkflowAgentsDeployedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEventData edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowAgentsDeployedEventData is valid`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData is undefined`, () => {
    const mockEventData = undefined as unknown as WorkflowAgentsDeployedEventData
    const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData is null`, () => {
    const mockEventData = null as unknown as WorkflowAgentsDeployedEventData
    const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEventData.workflowId edge cases
   ************************************************************/
  describe(`Test WorkflowAgentsDeployedEventData.workflowId`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.workflowId has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = 'short'
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEventData.objectKey edge cases
   ************************************************************/
  describe(`Test WorkflowAgentsDeployedEventData.objectKey`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.objectKey is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = undefined as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.objectKey is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = null as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.objectKey is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = ''
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.objectKey is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '      '
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEventData.objectKey has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = 'short'
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
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
  it(`returns the expected Success<WorkflowAgentsDeployedEvent> if the execution path is
      successful`, () => {
    const mockEventData = buildTestInputData()
    const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
    const expectedIdempotencyKey = `workflowId:${mockEventData.workflowId}:objectKey:${mockEventData.objectKey}`

    const expectedEvent: WorkflowAgentsDeployedEvent = {
      idempotencyKey: expectedIdempotencyKey,
      eventName: EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED,
      eventData: {
        workflowId: mockEventData.workflowId,
        objectKey: mockEventData.objectKey,
      },
      createdAt: mockDate,
      fromData: undefined as never,
    }
    Object.setPrototypeOf(expectedEvent, WorkflowAgentsDeployedEvent.prototype)

    const expectedResult = Result.makeSuccess(expectedEvent)

    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
