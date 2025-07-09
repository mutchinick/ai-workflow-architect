import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowCreatedEvent, WorkflowCreatedEventData } from './WorkflowCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-01-15T12:00:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockPromptEnhancementRounds = 3
const mockResponseEnhancementRounds = 5
const mockIdempotencyKey = `workflowId:${mockWorkflowId}:objectKey:${mockObjectKey}`

/**
 *
 */
function buildTestInputData(): WorkflowCreatedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
    promptEnhancementRounds: mockPromptEnhancementRounds,
    responseEnhancementRounds: mockResponseEnhancementRounds,
  }
}

function buildReconstituteInput(): {
  eventData: {
    workflowId: string
    objectKey: string
    promptEnhancementRounds: number
    responseEnhancementRounds: number
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    eventData: {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKey,
      promptEnhancementRounds: mockPromptEnhancementRounds,
      responseEnhancementRounds: mockResponseEnhancementRounds,
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
    it(`does not return a Failure if WorkflowCreatedEventData is valid`, () => {
      const testInput = buildTestInputData()
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData is undefined`, () => {
      const testInput = undefined as unknown as WorkflowCreatedEventData
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.workflowId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = undefined as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.workflowId is null`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = null as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.workflowId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = ''
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.workflowId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '      '
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.workflowId has length < 6`, () => {
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.objectKey is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = undefined as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.objectKey is null`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = null as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.objectKey is empty`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = ''
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.objectKey is blank`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = '      '
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.objectKey has length < 6`, () => {
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
     * Test WorkflowCreatedEventData.promptEnhancementRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.promptEnhancementRounds is less than 1`, () => {
      const testInput = buildTestInputData()
      testInput.promptEnhancementRounds = 0
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.promptEnhancementRounds is greater than 10`, () => {
      const testInput = buildTestInputData()
      testInput.promptEnhancementRounds = 11
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.promptEnhancementRounds is not an integer`, () => {
      const testInput = buildTestInputData()
      testInput.promptEnhancementRounds = 3.14
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.promptEnhancementRounds is not a number`, () => {
      const testInput = buildTestInputData()
      testInput.promptEnhancementRounds = '3' as never
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowCreatedEventData.responseEnhancementRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.responseEnhancementRounds is less than 1`, () => {
      const testInput = buildTestInputData()
      testInput.responseEnhancementRounds = 0
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.responseEnhancementRounds is greater than 10`, () => {
      const testInput = buildTestInputData()
      testInput.responseEnhancementRounds = 11
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.responseEnhancementRounds is not an integer`, () => {
      const testInput = buildTestInputData()
      testInput.responseEnhancementRounds = 5.14
      const result = WorkflowCreatedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEventData.responseEnhancementRounds is not a number`, () => {
      const testInput = buildTestInputData()
      testInput.responseEnhancementRounds = '5' as never
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

      const expectedIdempotencyKey = `workflowId:${testInput.workflowId}:objectKey:${testInput.objectKey}`
      const expectedEvent: WorkflowCreatedEvent = {
        idempotencyKey: expectedIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_CREATED,
        eventData: {
          workflowId: testInput.workflowId,
          promptEnhancementRounds: testInput.promptEnhancementRounds,
          responseEnhancementRounds: testInput.responseEnhancementRounds,
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
   * Test WorkflowCreatedEvent.reconstitute edge cases
   ************************************************************/
  describe(`Test WorkflowCreatedEvent.reconstitute`, () => {
    it(`does not return a Failure if WorkflowCreatedEvent is valid`, () => {
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
     * Test WorkflowCreatedEvent.eventData.promptEnhancementRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.promptEnhancementRounds is less than 1`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.promptEnhancementRounds = 0
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.promptEnhancementRounds is greater than 10`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.promptEnhancementRounds = 11
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.promptEnhancementRounds is not an integer`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.promptEnhancementRounds = 3.14
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.promptEnhancementRounds is not a number`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.promptEnhancementRounds = '3' as never
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
     * Test WorkflowCreatedEventData.responseEnhancementRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.responseEnhancementRounds is less than 1`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.responseEnhancementRounds = 0
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.responseEnhancementRounds is greater than 10`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.responseEnhancementRounds = 11
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.responseEnhancementRounds is not an integer`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.responseEnhancementRounds = 5.14
      const result = WorkflowCreatedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowCreatedEvent.eventData.responseEnhancementRounds is not a number`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.responseEnhancementRounds = '5' as never
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

      const expectedIdempotencyKey = `workflowId:${testInput.eventData.workflowId}:objectKey:${testInput.eventData.objectKey}`
      const expectedEvent: WorkflowCreatedEvent = {
        idempotencyKey: expectedIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_CREATED,
        eventData: {
          workflowId: testInput.eventData.workflowId,
          objectKey: testInput.eventData.objectKey,
          promptEnhancementRounds: testInput.eventData.promptEnhancementRounds,
          responseEnhancementRounds: testInput.eventData.responseEnhancementRounds,
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
