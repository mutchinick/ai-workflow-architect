import { Result } from '../event-store/errors/Result'
import { EventStoreEventName } from '../event-store/EventStoreEventName'
import { WorkflowContinuedEvent, WorkflowContinuedEventData } from './WorkflowContinuedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockContinued = true
const mockIdempotencyKey = `workflowId:${mockWorkflowId}:continued:${mockContinued}`

function buildTestInputData(): WorkflowContinuedEventData {
  return {
    workflowId: mockWorkflowId,
    continued: mockContinued,
  }
}

function buildReconstituteInput(): {
  eventData: {
    workflowId: string
    continued: true
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    eventData: {
      workflowId: mockWorkflowId,
      continued: mockContinued,
    },
    idempotencyKey: mockIdempotencyKey,
    createdAt: mockDate,
  }
}

describe(`Test WorkflowContinuedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowContinuedEvent.fromData
   ************************************************************/
  describe(`Test WorkflowContinuedEvent.fromData`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEventData edge cases
     ************************************************************/
    it(`does not return a Failure if WorkflowContinuedEventData is valid`, () => {
      const testInput = buildTestInputData()
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData is undefined`, () => {
      const testInput = undefined as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData is null`, () => {
      const testInput = null as never
      const result = WorkflowContinuedEvent.fromData(testInput)
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.workflowId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = undefined as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.workflowId is null`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = null as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.workflowId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = ''
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.workflowId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '      '
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.workflowId has length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '12345'
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEventData.continued edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.continued is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.continued = undefined as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.continued is null`, () => {
      const testInput = buildTestInputData()
      testInput.continued = null as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.continued is false`, () => {
      const testInput = buildTestInputData()
      testInput.continued = false as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEventData.continued is not a boolean`, () => {
      const testInput = buildTestInputData()
      testInput.continued = 'true' as never
      const result = WorkflowContinuedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<WorkflowContinuedEvent> if the execution path is
        successful`, () => {
      const mockWorkflowContinuedEventData = buildTestInputData()
      const result = WorkflowContinuedEvent.fromData(mockWorkflowContinuedEventData)

      const expectedEvent: WorkflowContinuedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_CONTINUED,
        eventData: {
          workflowId: mockWorkflowContinuedEventData.workflowId,
          continued: mockWorkflowContinuedEventData.continued,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowContinuedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)
      expect(Result.isSuccess(result)).toBe(true)

      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowContinuedEvent.reconstitute
   ************************************************************/
  describe(`Test WorkflowContinuedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if WorkflowContinuedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEvent.eventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.workflowId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = undefined as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.workflowId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = null as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.workflowId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = ''
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.workflowId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '      '
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.workflowId has length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '12345'
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowContinuedEvent.eventData.continued edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.continued is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.continued = undefined as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.continued is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.continued = null as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.continued is false`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.continued = false as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowContinuedEvent.eventData.continued is not a boolean`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.continued = 'true' as never
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<WorkflowContinuedEvent> if the execution path is
        successful`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowContinuedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )

      const expectedEvent: WorkflowContinuedEvent = {
        idempotencyKey: testInput.idempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_CONTINUED,
        eventData: {
          workflowId: testInput.eventData.workflowId,
          continued: testInput.eventData.continued,
        },
        createdAt: testInput.createdAt,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowContinuedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
