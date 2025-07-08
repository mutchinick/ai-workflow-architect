import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowStartedEvent, WorkflowStartedEventData } from './WorkflowStartedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockStarted = true
const mockIdempotencyKey = `workflow:${mockWorkflowId}`

function buildTestInputData(): WorkflowStartedEventData {
  return {
    workflowId: mockWorkflowId,
    started: mockStarted,
  }
}

function buildReconstituteInput(): {
  data: {
    workflowId: string
    started: true
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    data: {
      workflowId: mockWorkflowId,
      started: mockStarted,
    },
    idempotencyKey: mockIdempotencyKey,
    createdAt: mockDate,
  }
}

describe(`Test WorkflowStartedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent.fromData
   ************************************************************/
  describe(`Test WorkflowStartedEvent.fromData`, () => {
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData is undefined`, () => {
      const testInput = undefined as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData is null`, () => {
      const testInput = null as never
      const result = WorkflowStartedEvent.fromData(testInput)
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.workflowId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = undefined as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.workflowId is null`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = null as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.workflowId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = ''
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.workflowId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '      '
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.workflowId has length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '12345'
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowStartedEventData.started edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.started is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.started = undefined as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.started is null`, () => {
      const testInput = buildTestInputData()
      testInput.started = null as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.started is false`, () => {
      const testInput = buildTestInputData()
      testInput.started = false as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEventData.started is not a boolean`, () => {
      const testInput = buildTestInputData()
      testInput.started = 'true' as never
      const result = WorkflowStartedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results for the "Happy Path"
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
      }
      Object.setPrototypeOf(expectedEvent, WorkflowStartedEvent.prototype)

      const expectedResult = Result.makeSuccess(expectedEvent)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent.reconstitute
   ************************************************************/
  describe(`Test WorkflowStartedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowStartedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowStartedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowStartedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.data = undefined as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.data = null as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowStartedEvent.eventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.workflowId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.workflowId = undefined as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.workflowId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.workflowId = null as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.workflowId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.workflowId = ''
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.workflowId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.workflowId = '      '
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.workflowId has length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.workflowId = '12345'
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowStartedEvent.eventData.started edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.started is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.started = undefined as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.started is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.started = null as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.started is false`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.started = false as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if WorkflowStartedEvent.eventData.started is not a boolean`, () => {
      const testInput = buildReconstituteInput()
      testInput.data.started = 'true' as never
      const result = WorkflowStartedEvent.reconstitute(testInput.data, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results for the "Happy Path"
     ************************************************************/
    it(`returns the expected Success<WorkflowStartedEvent> if the execution path is successful`, () => {
      const { data, idempotencyKey, createdAt } = buildReconstituteInput()
      const result = WorkflowStartedEvent.reconstitute(data, idempotencyKey, createdAt)

      const expectedEvent: WorkflowStartedEvent = {
        idempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_STARTED,
        eventData: {
          workflowId: data.workflowId,
          started: data.started,
        },
        createdAt,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowStartedEvent.prototype)

      const expectedResult = Result.makeSuccess(expectedEvent)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
