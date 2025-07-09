import { Result } from './errors/Result'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowAgentsDeployedEvent, WorkflowAgentsDeployedEventData } from './WorkflowAgentsDeployedEvent'

jest.useFakeTimers().setSystemTime(new Date('2025-09-10T15:45:00Z'))

const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = 'mockObjectKey'
const mockIdempotencyKey = `workflowId:${mockWorkflowId}:objectKey:${mockObjectKey}`

function buildTestInputData(): WorkflowAgentsDeployedEventData {
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
describe(`Test WorkflowAgentsDeployedEvent`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEven.fromData
   ************************************************************/
  describe(`Test WorkflowAgentsDeployedEven.fromData`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowAgentsDeployedEventData
     ************************************************************/
    it(`does not return a Failure if WorkflowAgentsDeployedEventData is valid`, () => {
      const mockEventData = buildTestInputData()
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData is undefined`, () => {
      const mockEventData = undefined as unknown as WorkflowAgentsDeployedEventData
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
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
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.workflowId is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = undefined as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.workflowId is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = null as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.workflowId is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = ''
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.workflowId is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = '      '
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.workflowId has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.workflowId = 'short'
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowAgentsDeployedEventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.objectKey is undefined`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = undefined as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.objectKey is null`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = null as never
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.objectKey is empty`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = ''
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.objectKey is blank`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = '      '
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEventData.objectKey has length < 6`, () => {
      const mockEventData = buildTestInputData()
      mockEventData.objectKey = 'short'
      const result = WorkflowAgentsDeployedEvent.fromData(mockEventData)
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
    it(`returns the expected Success<WorkflowAgentsDeployedEvent> if the execution path
        is successful`, () => {
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
      }
      Object.setPrototypeOf(expectedEvent, WorkflowAgentsDeployedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent.reconstitute
   ************************************************************/
  describe(`Test WorkflowAgentsDeployedEvent.reconstitute`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowAgentsDeployedEvent edge cases
     ************************************************************/
    it(`does not return a Failure if WorkflowAgentsDeployedEvent is valid`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowAgentsDeployedEvent.reconstitute(
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
     * Test WorkflowAgentsDeployedEvent.idempotencyKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.idempotencyKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = undefined as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.idempotencyKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.idempotencyKey = null as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
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
     * Test WorkflowAgentsDeployedEvent.createdAt edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.createdAt is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = undefined as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.createdAt is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.createdAt = null as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
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
     * Test WorkflowAgentsDeployedEvent.eventData edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = undefined as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData = null as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
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
     * Test WorkflowAgentsDeployedEvent.eventData.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.workflowId is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = undefined as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.workflowId is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = null as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.workflowId is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = ''
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.workflowId is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '      '
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.workflowId length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.workflowId = '12345'
      const result = WorkflowAgentsDeployedEvent.reconstitute(
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
     * Test WorkflowAgentsDeployedEvent.eventData.objectKey edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.objectKey is undefined`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = undefined as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.objectKey is null`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = null as never
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.objectKey is empty`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = ''
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.objectKey is blank`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '      '
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if
        WorkflowAgentsDeployedEvent.eventData.objectKey length < 6`, () => {
      const testInput = buildReconstituteInput()
      testInput.eventData.objectKey = '12345'
      const result = WorkflowAgentsDeployedEvent.reconstitute(
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
    it(`returns the expected Success<WorkflowAgentsDeployedEvent> if the execution path
        is successful`, () => {
      const testInput = buildReconstituteInput()
      const result = WorkflowAgentsDeployedEvent.reconstitute(
        testInput.eventData,
        testInput.idempotencyKey,
        testInput.createdAt,
      )

      const expectedIdempotencyKey = `workflowId:${testInput.eventData.workflowId}:objectKey:${testInput.eventData.objectKey}`
      const expectedEvent: WorkflowAgentsDeployedEvent = {
        idempotencyKey: expectedIdempotencyKey,
        eventName: EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED,
        eventData: {
          workflowId: testInput.eventData.workflowId,
          objectKey: testInput.eventData.objectKey,
        },
        createdAt: mockDate,
      }
      Object.setPrototypeOf(expectedEvent, WorkflowAgentsDeployedEvent.prototype)
      const expectedResult = Result.makeSuccess(expectedEvent)

      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
