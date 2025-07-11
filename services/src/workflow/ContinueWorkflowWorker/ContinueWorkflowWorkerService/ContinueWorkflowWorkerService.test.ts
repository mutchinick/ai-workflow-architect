import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { WorkflowContinuedEvent } from '../../../events/WorkflowContinuedEvent'
import { WorkflowStartedEvent } from '../../../events/WorkflowStartedEvent'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { ContinueWorkflowWorkerService } from './ContinueWorkflowWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockWorkflowId = 'mockWorkflowId'
const mockStarted = true

function buildMockIncomingWorkflowStartedEvent(): TypeUtilsMutable<WorkflowStartedEvent> {
  const mockClass: WorkflowStartedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_STARTED,
    eventData: {
      workflowId: mockWorkflowId,
      started: mockStarted,
    },
    createdAt: mockDate,
  }
  Object.setPrototypeOf(mockClass, WorkflowStartedEvent.prototype)
  return mockClass
}

const mockIncomingWorkflowStartedEvent = buildMockIncomingWorkflowStartedEvent()

function buildExpectedWorkflowContinuedEvent(): TypeUtilsMutable<WorkflowContinuedEvent> {
  const mockClass = WorkflowContinuedEvent.fromData({
    workflowId: mockWorkflowId,
    continued: true,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedWorkflowContinuedEvent = buildExpectedWorkflowContinuedEvent()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildEventStoreClient_succeeds(): IEventStoreClient {
  return { publish: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildEventStoreClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEventStoreClient {
  return {
    publish: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

describe(`Workflow Service ContinueWorkflowWorker ContinueWorkflowWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowStartedEvent is valid`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const result = await continueWorkflowWorkerService.continueWorkflow(mockIncomingWorkflowStartedEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEvent is undefined`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const mockTestEvent = undefined as never
    const result = await continueWorkflowWorkerService.continueWorkflow(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEvent is null`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const mockTestEvent = null as never
    const result = await continueWorkflowWorkerService.continueWorkflow(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowStartedEvent is not an instance of the class`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const mockTestEvent = { ...mockIncomingWorkflowStartedEvent }
    const result = await continueWorkflowWorkerService.continueWorkflow(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`propagates the Failure if WorkflowContinuedEvent.fromData returns a Failure`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(WorkflowContinuedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await continueWorkflowWorkerService.continueWorkflow(mockIncomingWorkflowStartedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    await continueWorkflowWorkerService.continueWorkflow(mockIncomingWorkflowStartedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected WorkflowContinuedEvent`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    await continueWorkflowWorkerService.continueWorkflow(mockIncomingWorkflowStartedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowContinuedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockEventStoreClient = buildEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const result = await continueWorkflowWorkerService.continueWorkflow(mockIncomingWorkflowStartedEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<void> if the execution path is successful`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(mockEventStoreClient)
    const result = await continueWorkflowWorkerService.continueWorkflow(mockIncomingWorkflowStartedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
