import { Result } from '../../errors/Result'
import { EventStoreEventName } from '../../event-store/EventStoreEventName'
import { JobCreatedEvent, JobCreatedEventData } from './JobCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockJobId = 'mockJobId'
const mockCreated = true
const mockIdempotencyKey = `jobId:${mockJobId}:created:${mockCreated}`

function buildTestInputData(): JobCreatedEventData {
  return {
    jobId: mockJobId,
    created: mockCreated,
  }
}

function buildReconstituteInput(): {
  eventData: {
    jobId: string
    created: true
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    eventData: {
      jobId: mockJobId,
      created: mockCreated,
    },
    idempotencyKey: mockIdempotencyKey,
    createdAt: mockDate,
  }
}

describe(`Test JobCreatedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent.fromData
   ************************************************************/
  describe(`Test JobCreatedEvent.fromData`, () => {
    /*
     *
     *
     ************************************************************
     * Test JobCreatedEventData edge cases
     ************************************************************/
    it(`does not return a Failure if JobCreatedEventData is valid`, () => {
      const testInput = buildTestInputData()
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData is undefined`, () => {
      const testInput = undefined as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData is null`, () => {
      const testInput = null as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEventData.jobId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.jobId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = undefined as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.jobId is null`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = null as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.jobId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = ''
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.jobId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = '      '
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.jobId length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.jobId = '12345'
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEventData.created edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.created is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.created = undefined as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.created is null`, () => {
      const testInput = buildTestInputData()
      testInput.created = null as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.created is false`, () => {
      const testInput = buildTestInputData()
      testInput.created = false as never
      const result = JobCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEventData.created is not a boolean`, () => {
      const testInput = buildTestInputData()
      testInput.created = 'true' as never
      const result = JobCreatedEvent.fromData(testInput)
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
    it(`returns the expected Success<JobCreatedEvent> if the execution path is
        successful`, () => {
      const mockJobCreatedEventData = buildTestInputData()
      const result = JobCreatedEvent.fromData(mockJobCreatedEventData)

      const expectedEvent: JobCreatedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.JOB_CREATED_EVENT,
        eventData: {
          jobId: mockJobCreatedEventData.jobId,
          created: mockJobCreatedEventData.created,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, JobCreatedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent.reconstitute
   ************************************************************/
  describe(`Test JobCreatedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test JobCreatedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if JobCreatedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEvent.eventData.jobId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.jobId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = undefined as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.jobId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = null as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.jobId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = ''
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.jobId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = '      '
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.jobId length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.jobId = '12345'
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test JobCreatedEvent.eventData.created edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.created is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.created = undefined as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.created is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.created = null as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.created is false`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.created = false as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        JobCreatedEvent.eventData.created is not a boolean`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.created = 'true' as never
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)
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
    it(`returns the expected Success<JobCreatedEvent> if the execution path is
        successful`, () => {
      const testInput = buildReconstituteInput()
      const result = JobCreatedEvent.reconstitute(testInput.eventData, testInput.idempotencyKey, testInput.createdAt)

      const expectedEvent: JobCreatedEvent = {
        idempotencyKey: testInput.idempotencyKey,
        eventName: EventStoreEventName.JOB_CREATED_EVENT,
        eventData: {
          jobId: testInput.eventData.jobId,
          created: testInput.eventData.created,
        },
        createdAt: testInput.createdAt,
      }
      Object.setPrototypeOf(expectedEvent, JobCreatedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
