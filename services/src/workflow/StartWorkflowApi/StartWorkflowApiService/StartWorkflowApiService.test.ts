import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { WorkflowStartedEvent, WorkflowStartedEventData } from '../../../events/WorkflowStartedEvent'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IncomingStartWorkflowRequest } from '../model/IncomingStartWorkflowRequest'
import { StartWorkflowApiService, StartWorkflowApiServiceOutput } from './StartWorkflowApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

function buildMockIncomingRequest(): TypeUtilsMutable<IncomingStartWorkflowRequest> {
  const mockClass = IncomingStartWorkflowRequest.fromInput({
    workflowId: 'mockWorkflowId',
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingRequest = buildMockIncomingRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockEventStoreClient_succeeds(value?: unknown): IEventStoreClient {
  const mockResult = Result.makeSuccess(value)
  return { publish: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockEventStoreClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEventStoreClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { publish: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Workflow Service StartWorkflowApi StartWorkflowApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingStartWorkflowRequest edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingStartWorkflowRequest is valid`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const result = await startWorkflowApiService.startWorkflow(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequest is undefined`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const mockTestRequest = undefined as never
    const result = await startWorkflowApiService.startWorkflow(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequest is null`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const mockTestRequest = null as never
    const result = await startWorkflowApiService.startWorkflow(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequest is not an instance of the class`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const mockTestRequest = { ...mockIncomingRequest }
    const result = await startWorkflowApiService.startWorkflow(mockTestRequest)
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
  it(`propagates the Failure if WorkflowStartedEvent.fromData returns a Failure`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(WorkflowStartedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await startWorkflowApiService.startWorkflow(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    await startWorkflowApiService.startWorkflow(mockIncomingRequest)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected input`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    await startWorkflowApiService.startWorkflow(mockIncomingRequest)
    const mockWorkflowStartedEventInput: WorkflowStartedEventData = {
      workflowId: mockIncomingRequest.workflowId,
      started: true,
    }
    const expectedWorkflowStartedEventResult = WorkflowStartedEvent.fromData(mockWorkflowStartedEventInput)
    const expectedWorkflowStartedEvent = Result.getSuccessValueOrThrow(expectedWorkflowStartedEventResult)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowStartedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockEventStoreClient = buildMockEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const result = await startWorkflowApiService.startWorkflow(mockIncomingRequest)
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
  it(`returns the expected Success<StartWorkflowApiServiceOutput> if
      EventStoreClient.publish returns a Failure of kind DuplicateEventRaisedError`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_fails('DuplicateEventError')
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const result = await startWorkflowApiService.startWorkflow(mockIncomingRequest)
    const expectedOutput: StartWorkflowApiServiceOutput = {
      workflowId: mockIncomingRequest.workflowId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<StartWorkflowApiServiceOutput> if the execution
      path is successful`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const startWorkflowApiService = new StartWorkflowApiService(mockEventStoreClient)
    const result = await startWorkflowApiService.startWorkflow(mockIncomingRequest)
    const expectedOutput: StartWorkflowApiServiceOutput = {
      workflowId: mockIncomingRequest.workflowId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
