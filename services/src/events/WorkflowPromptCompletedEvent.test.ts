import { Result } from '../event-store/errors/Result'
import { EventStoreEventName } from '../event-store/EventStoreEventName'
import { WorkflowPromptCompletedEvent, WorkflowPromptCompletedEventData } from './WorkflowPromptCompletedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-07-07T10:30:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockIdempotencyKey = `workflowId:${mockWorkflowId}:objectKey:${mockObjectKey}`

function buildTestInputData(): WorkflowPromptCompletedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
  }
}

function buildReconstituteInput(): {
  eventData: {
    workflowId: string
    objectKey: string
  }
  idempotencyKey: string
  createdAt: string
} {
  return {
    eventData: {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKey,
    },
    idempotencyKey: mockIdempotencyKey,
    createdAt: mockDate,
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
   * Test WorkflowPromptCompletedEvent.fromData
   ************************************************************/
  describe(`Test WorkflowPromptCompletedEvent.fromData edge cases`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowPromptCompletedEventData edge cases
     ************************************************************/
    it(`does not return a Failure if WorkflowPromptCompletedEventData is valid`, () => {
      const mockEventData = buildTestInputData()
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData is undefined`, () => {
      const mockEventData = undefined as unknown as WorkflowPromptCompletedEventData
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.workflowId has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '12345'
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowPromptCompletedEventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.objectKey is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = undefined as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.objectKey is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = null as never
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.objectKey is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = ''
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.objectKey is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '      '
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEventData.objectKey has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '12345'
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)
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
    it(`returns the expected Success<WorkflowPromptCompletedEvent> if the execution path
        is successful`, () => {
      const mockEventData = buildTestInputData()
      const result = WorkflowPromptCompletedEvent.fromData(mockEventData)

      const expectedEvent: WorkflowPromptCompletedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_PROMPT_COMPLETED,
        eventData: {
          workflowId: mockEventData.workflowId,
          objectKey: mockEventData.objectKey,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowPromptCompletedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowPromptCompletedEvent.reconstitute
   ************************************************************/
  describe(`Test WorkflowPromptCompletedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowPromptCompletedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if WorkflowPromptCompletedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowPromptCompletedEvent.reconstitute(
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
     * Test WorkflowPromptCompletedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
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
     * Test WorkflowPromptCompletedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
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
     * Test WorkflowPromptCompletedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
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
     * Test WorkflowPromptCompletedEvent.eventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.workflowId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = undefined as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.workflowId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = null as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.workflowId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = ''
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.workflowId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '      '
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.workflowId length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '12345'
      const result = WorkflowPromptCompletedEvent.reconstitute(
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
     * Test WorkflowPromptCompletedEvent.eventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.objectKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = undefined as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.objectKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = null as never
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.objectKey is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = ''
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.objectKey is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '      '
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowPromptCompletedEvent.eventData.objectKey length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '12345'
      const result = WorkflowPromptCompletedEvent.reconstitute(
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
    it(`returns the expected Success<WorkflowPromptCompletedEvent> if the execution path
        is successful`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowPromptCompletedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )

      const expectedEvent: WorkflowPromptCompletedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_PROMPT_COMPLETED,
        eventData: {
          workflowId: testInput.eventData.workflowId,
          objectKey: testInput.eventData.objectKey,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowPromptCompletedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
