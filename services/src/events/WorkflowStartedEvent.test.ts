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
    const invalidTestCases = [
      // WorkflowStartedEventData
      {
        description: 'WorkflowStartedEventData is undefined',
        input: undefined,
      },
      {
        description: 'WorkflowStartedEventData is null',
        input: null,
      },
      // WorkflowStartedEventData.workflowId
      {
        description: 'WorkflowStartedEventData.workflowId is undefined',
        input: { ...buildTestInputData(), workflowId: undefined },
      },
      {
        description: 'WorkflowStartedEventData.workflowId is null',
        input: { ...buildTestInputData(), workflowId: null },
      },
      {
        description: 'WorkflowStartedEventData.workflowId is empty',
        input: { ...buildTestInputData(), workflowId: '' },
      },
      {
        description: 'WorkflowStartedEventData.workflowId is blank',
        input: { ...buildTestInputData(), workflowId: '      ' },
      },
      {
        description: 'WorkflowStartedEventData.workflowId has length < 6',
        input: { ...buildTestInputData(), workflowId: '12345' },
      },
      // WorkflowStartedEventData.started
      {
        description: 'WorkflowStartedEventData.started is undefined',
        input: { ...buildTestInputData(), started: undefined },
      },
      {
        description: 'WorkflowStartedEventData.started is null',
        input: { ...buildTestInputData(), started: null },
      },
      {
        description: 'WorkflowStartedEventData.started is false',
        input: { ...buildTestInputData(), started: false },
      },
      {
        description: 'WorkflowStartedEventData.started is not a boolean',
        input: { ...buildTestInputData(), started: 'true' },
      },
    ]

    // --- Data-Driven Test for all Failure Cases ---
    it.each(invalidTestCases)(
      `returns a non-transient Failure of kind InvalidArgumentsError if $description`,
      ({ input }) => {
        const result = WorkflowStartedEvent.fromData(input as never)
        expect(Result.isFailure(result)).toBe(true)
        expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
        expect(Result.isFailureTransient(result)).toBe(false)
      },
    )

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
    const testData = buildTestInputData()
    const idempotencyKey = `workflow:${testData.workflowId}`
    const createdAt = mockDate

    const invalidReconstituteTestCases = [
      //
      // WorkflowStartedEvent.idempotencyKey
      //
      {
        description: 'WorkflowStartedEvent.idempotencyKey is undefined',
        input: { idempotencyKey: undefined, createdAt, data: testData },
      },
      {
        description: 'WorkflowStartedEvent.idempotencyKey is null',
        input: { idempotencyKey: null, createdAt, data: testData },
      },

      //
      // WorkflowStartedEvent.createdAt
      //
      {
        description: 'WorkflowStartedEvent.createdAt is undefined',
        input: { idempotencyKey, createdAt: undefined, data: testData },
      },
      {
        description: 'WorkflowStartedEvent.createdAt is null',
        input: { idempotencyKey, createdAt: null, data: testData },
      },

      //
      // WorkflowStartedEvent.eventData
      //
      {
        description: 'WorkflowStartedEvent.eventData is undefined',
        input: { idempotencyKey, createdAt, data: undefined },
      },
      {
        description: 'WorkflowStartedEvent.eventData is null',
        input: { idempotencyKey, createdAt, data: null },
      },

      //
      // WorkflowStartedEvent.eventData.workflowId
      //
      {
        description: 'WorkflowStartedEvent.eventData.workflowId is undefined',
        input: { idempotencyKey, createdAt, data: { ...testData, workflowId: undefined } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.workflowId is null',
        input: { idempotencyKey, createdAt, data: { ...testData, workflowId: null } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.workflowId is empty',
        input: { idempotencyKey, createdAt, data: { ...testData, workflowId: '' } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.workflowId is blank',
        input: { idempotencyKey, createdAt, data: { ...testData, workflowId: '      ' } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.workflowId has length < 6',
        input: { idempotencyKey, createdAt, data: { ...testData, workflowId: '12345' } },
      },

      //
      // WorkflowStartedEvent.eventData.started
      //
      {
        description: 'WorkflowStartedEvent.eventData.started is undefined',
        input: { idempotencyKey, createdAt, data: { ...testData, started: undefined } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.started is null',
        input: { idempotencyKey, createdAt, data: { ...testData, started: null } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.started is false',
        input: { idempotencyKey, createdAt, data: { ...testData, started: false } },
      },
      {
        description: 'WorkflowStartedEvent.eventData.started is not a boolean',
        input: { idempotencyKey, createdAt, data: { ...testData, started: 'true' } },
      },
    ]

    it.each(invalidReconstituteTestCases)(
      `returns a non-transient Failure of kind InvalidArgumentsError if $description`,
      ({ input }) => {
        const result = WorkflowStartedEvent.reconstitute(
          input.data as never,
          input.idempotencyKey as never,
          input.createdAt as never,
        )
        expect(Result.isFailure(result)).toBe(true)
        expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
        expect(Result.isFailureTransient(result)).toBe(false)
      },
    )

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
