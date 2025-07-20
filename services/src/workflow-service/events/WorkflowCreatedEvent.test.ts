import { Result } from '../../errors/Result'
import { EventStoreEventName } from '../../event-store/EventStoreEventName'
import { WorkflowCreatedEvent, WorkflowCreatedEventData } from './WorkflowCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-01-15T12:00:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 5
const mockIdempotencyKey = `workflowId:${mockWorkflowId}:objectKey:${mockObjectKey}`

/**
 *
 */
function buildTestInputData(): WorkflowCreatedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
    enhancePromptRounds: mockEnhancePromptRounds,
    enhanceResultRounds: mockEnhanceResultRounds,
  }
}

function buildReconstituteInput(): {
  eventData: {
    workflowId: string
    objectKey: string
    enhancePromptRounds: number
    enhanceResultRounds: number
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    eventData: {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKey,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    idempotencyKey: mockIdempotencyKey,
    createdAt: mockDate,
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
   * Test WorkflowCreatedEvent.fromData
   ************************************************************/
  describe(`Test WorkflowCreatedEvent.fromData`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowCreatedEventData edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowCreatedEventData is valid`, () => {
      const testInput = buildTestInputData()
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData is undefined`, () => {
      const testInput = undefined as unknown as WorkflowCreatedEventData
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData is null`, () => {
      const testInput = null as unknown as WorkflowCreatedEventData
      const result = WorkflowCreatedEvent.fromData(testInput)
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.workflowId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = undefined as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.workflowId is null`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = null as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.workflowId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = ''
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.workflowId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '      '
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.workflowId length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '12345'
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowCreatedEventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.objectKey is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = undefined as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.objectKey is null`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = null as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.objectKey is empty`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = ''
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.objectKey is blank`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = '      '
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.objectKey length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = '12345'
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowCreatedEventData.enhancePromptRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhancePromptRounds is less than 1`, () => {
      const testInput = buildTestInputData()
      testInput.enhancePromptRounds = 0
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhancePromptRounds is greater than 10`, () => {
      const testInput = buildTestInputData()
      testInput.enhancePromptRounds = 11
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhancePromptRounds is not an integer`, () => {
      const testInput = buildTestInputData()
      testInput.enhancePromptRounds = 3.14
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhancePromptRounds is not a number`, () => {
      const testInput = buildTestInputData()
      testInput.enhancePromptRounds = '3' as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowCreatedEventData.enhanceResultRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhanceResultRounds is less than 1`, () => {
      const testInput = buildTestInputData()
      testInput.enhanceResultRounds = 0
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhanceResultRounds is greater than 10`, () => {
      const testInput = buildTestInputData()
      testInput.enhanceResultRounds = 11
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhanceResultRounds is not an integer`, () => {
      const testInput = buildTestInputData()
      testInput.enhanceResultRounds = 5.14
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEventData.enhanceResultRounds is not a number`, () => {
      const testInput = buildTestInputData()
      testInput.enhanceResultRounds = '5' as never
      const result = WorkflowCreatedEvent.fromData(testInput)
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
    it(`returns the expected Success<WorkflowCreatedEvent> if the execution path is
        successful`, () => {
      const testInput = buildTestInputData()
      const result = WorkflowCreatedEvent.fromData(testInput)

      const expectedEvent: WorkflowCreatedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_CREATED_EVENT,
        eventData: {
          workflowId: testInput.workflowId,
          enhancePromptRounds: testInput.enhancePromptRounds,
          enhanceResultRounds: testInput.enhanceResultRounds,
          objectKey: testInput.objectKey,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowCreatedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.reconstitute
   ************************************************************/
  describe(`Test WorkflowCreatedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowCreatedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowCreatedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowCreatedEvent.reconstitute(
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
     * Test WorkflowCreatedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = WorkflowCreatedEvent.reconstitute(
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
     * Test WorkflowCreatedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = WorkflowCreatedEvent.reconstitute(
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
     * ************************************************************
     * Test WorkflowCreatedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = WorkflowCreatedEvent.reconstitute(
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
     * Test WorkflowCreatedEvent.eventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.workflowId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = undefined as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.workflowId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = null as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.workflowId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = ''
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.workflowId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '      '
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.workflowId length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '12345'
      const result = WorkflowCreatedEvent.reconstitute(
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
     * Test WorkflowCreatedEvent.eventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.objectKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = undefined as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.objectKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = null as never
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.objectKey is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = ''
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.objectKey is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '      '
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.objectKey length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '12345'
      const result = WorkflowCreatedEvent.reconstitute(
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
     * Test WorkflowCreatedEvent.eventData.enhancePromptRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhancePromptRounds is less than 1`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhancePromptRounds = 0
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhancePromptRounds is greater than 10`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhancePromptRounds = 11
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhancePromptRounds is not an integer`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhancePromptRounds = 3.14
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhancePromptRounds is not a number`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhancePromptRounds = '3' as never
      const result = WorkflowCreatedEvent.reconstitute(
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
     * Test WorkflowCreatedEventData.enhanceResultRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhanceResultRounds is less than 1`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhanceResultRounds = 0
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhanceResultRounds is greater than 10`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhanceResultRounds = 11
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhanceResultRounds is not an integer`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhanceResultRounds = 5.14
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowCreatedEvent.eventData.enhanceResultRounds is not a number`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.enhanceResultRounds = '5' as never
      const result = WorkflowCreatedEvent.reconstitute(
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
    it(`returns the expected Success<WorkflowCreatedEvent> if the execution path is
        successful`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )

      const expectedEvent: WorkflowCreatedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_CREATED_EVENT,
        eventData: {
          workflowId: testInput.eventData.workflowId,
          objectKey: testInput.eventData.objectKey,
          enhancePromptRounds: testInput.eventData.enhancePromptRounds,
          enhanceResultRounds: testInput.eventData.enhanceResultRounds,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowCreatedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
