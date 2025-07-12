import { Result } from '../../errors/Result'
import { EventStoreEventName } from '../../event-store/EventStoreEventName'
import { StepProcessedEvent, StepProcessedEventData } from './StepProcessedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockJobId = 'mockJobId'
const mockProcessed = true
const mockIdempotencyKey = `jobId:${mockJobId}:processed:${mockProcessed}`

function buildTestInputData(): StepProcessedEventData {
  return {
    jobId: mockJobId,
    processed: mockProcessed,
  }
}

function buildReconstituteInput(): {
  eventData: {
    jobId: string
    processed: true
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    eventData: {
      jobId: mockJobId,
      processed: mockProcessed,
    },
    idempotencyKey: mockIdempotencyKey,
    createdAt: mockDate,
  }
}

describe(`Test StepProcessedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test StepProcessedEvent.fromData
   ************************************************************/
  describe(`Test StepProcessedEvent.fromData`, () => {
    /*
     *
     *
     ************************************************************
     * Test StepProcessedEventData edge cases
     ************************************************************/
    it(`does not return a Failure if StepProcessedEventData is valid`, () => {
      const testInput = buildTestInputData()
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData is undefined`, () => {
      const testInput = undefined as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData is null`, () => {
      const testInput = null as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEventData.jobId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.jobId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = undefined as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.jobId is null`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = null as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.jobId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = ''
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.jobId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = '      '
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.jobId length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = '12345'
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEventData.processed edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.processed is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.processed = undefined as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.processed is null`, () => {
      const testInput = buildTestInputData()
      testInput.processed = null as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.processed is false`, () => {
      const testInput = buildTestInputData()
      testInput.processed = false as never
      const result = StepProcessedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEventData.processed is not a boolean`, () => {
      const testInput = buildTestInputData()
      testInput.processed = 'true' as never
      const result = StepProcessedEvent.fromData(testInput)
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
    it(`returns the expected Success<StepProcessedEvent> if the execution path is
        successful`, () => {
      const mockStepProcessedEventData = buildTestInputData()
      const result = StepProcessedEvent.fromData(mockStepProcessedEventData)

      const expectedEvent: StepProcessedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.STEP_PROCESSED_EVENT,
        eventData: {
          jobId: mockStepProcessedEventData.jobId,
          processed: mockStepProcessedEventData.processed,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, StepProcessedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)
      expect(Result.isSuccess(result)).toBe(true)

      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test StepProcessedEvent.reconstitute
   ************************************************************/
  describe(`Test StepProcessedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test StepProcessedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if StepProcessedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEvent.eventData.jobId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.jobId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = undefined as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.jobId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = null as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.jobId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = ''
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.jobId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = '      '
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.jobId length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = '12345'
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test StepProcessedEvent.eventData.processed edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.processed is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.processed = undefined as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.processed is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.processed = null as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.processed is false`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.processed = false as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        StepProcessedEvent.eventData.processed is not a boolean`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.processed = 'true' as never
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
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
    it(`returns the expected Success<StepProcessedEvent> if the execution path is
        successful`, () => {
      const testInput = buildReconstituteInput()
      const result = StepProcessedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)

      const expectedEvent: StepProcessedEvent = {
        idempotencyKey: testInput.idempotencyKey,
        eventName: EventStoreEventName.STEP_PROCESSED_EVENT,
        eventData: {
          jobId: testInput.eventData.jobId,
          processed: testInput.eventData.processed,
        },
        createdAt: testInput.createdAt,
      }
      Object.setPrototypeOf(expectedEvent, StepProcessedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
