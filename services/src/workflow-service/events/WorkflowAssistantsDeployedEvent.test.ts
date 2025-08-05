import { Result } from '../../errors/Result'
import { EventStoreEventName } from '../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../shared/TypeUtils'
import { WorkflowAssistantsDeployedEvent, WorkflowAssistantsDeployedEventData } from './WorkflowAssistantsDeployedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-01-15T12:00:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockIdempotencyKey = `workflowId:${mockWorkflowId}:objectKey:${mockObjectKey}`

/**
 *
 */
function buildTestInputData(): WorkflowAssistantsDeployedEventData {
  return {
    workflowId: mockWorkflowId,
    objectKey: mockObjectKey,
  }
}

function buildReconstituteInput(): TypeUtilsMutable<WorkflowAssistantsDeployedEvent> {
  return {
    eventName: EventStoreEventName.WORKFLOW_ASSISTANTS_DEPLOYED_EVENT,
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
describe(`Test Workflow Service events WorkflowAssistantsDeployedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowAssistantsDeployedEvent.fromData
   ************************************************************/
  describe(`Test WorkflowAssistantsDeployedEvent.fromData`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowAssistantsDeployedEventData edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowAssistantsDeployedEventData is
        valid`, () => {
      const testInput = buildTestInputData()
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData is undefined`, () => {
      const testInput = undefined as unknown as WorkflowAssistantsDeployedEventData
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData is null`, () => {
      const testInput = null as unknown as WorkflowAssistantsDeployedEventData
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowAssistantsDeployedEventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.workflowId is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = undefined as never
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.workflowId is null`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = null as never
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.workflowId is empty`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = ''
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.workflowId is blank`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '      '
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.workflowId length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.workflowId = '12345'
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowAssistantsDeployedEventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.objectKey is undefined`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = undefined as never
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.objectKey is null`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = null as never
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.objectKey is empty`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = ''
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.objectKey is blank`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = '      '
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEventData.objectKey length < 6`, () => {
      const testInput = buildTestInputData()
      testInput.objectKey = '12345'
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)
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
    it(`returns the expected Success<WorkflowAssistantsDeployedEvent> if the execution
        path is successful`, () => {
      const testInput = buildTestInputData()
      const result = WorkflowAssistantsDeployedEvent.fromData(testInput)

      const expectedEvent: WorkflowAssistantsDeployedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_ASSISTANTS_DEPLOYED_EVENT,
        eventData: {
          workflowId: testInput.workflowId,
          objectKey: testInput.objectKey,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowAssistantsDeployedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAssistantsDeployedEvent.reconstitute
   ************************************************************/
  describe(`Test WorkflowAssistantsDeployedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowAssistantsDeployedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowAssistantsDeployedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
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
     * Test WorkflowAssistantsDeployedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
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
     * Test WorkflowAssistantsDeployedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
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
     * Test WorkflowAssistantsDeployedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
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
     * Test WorkflowAssistantsDeployedEvent.eventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.workflowId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = undefined as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.workflowId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = null as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.workflowId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = ''
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.workflowId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '      '
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.workflowId length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '12345'
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
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
     * Test WorkflowAssistantsDeployedEvent.eventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.objectKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = undefined as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.objectKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = null as never
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.objectKey is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = ''
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.objectKey is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '      '
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowAssistantsDeployedEvent.eventData.objectKey length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '12345'
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
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
    it(`returns the expected Success<WorkflowAssistantsDeployedEvent> if the execution
        path is successful`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowAssistantsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )

      const expectedEvent: WorkflowAssistantsDeployedEvent = {
        idempotencyKey: mockIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_ASSISTANTS_DEPLOYED_EVENT,
        eventData: {
          workflowId: testInput.eventData.workflowId,
          objectKey: testInput.eventData.objectKey,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowAssistantsDeployedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
