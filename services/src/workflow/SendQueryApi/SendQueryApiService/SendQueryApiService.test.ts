import KSUID from 'ksuid'
import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { WorkflowCreatedEvent, WorkflowCreatedEventData } from '../../events/WorkflowCreatedEvent'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow, WorkflowProps } from '../../models/Workflow'
import { IncomingSendQueryRequest } from '../IncomingSendQueryRequest/IncomingSendQueryRequest'
import { SendQueryApiService, SendQueryApiServiceOutput } from './SendQueryApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockWorkflowId = 'mockWorkflowId'
const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 2
const mockObjectKey = `workflow-${mockWorkflowId}/workflow-${mockWorkflowId}-created.json`

function buildMockIncomingRequest(): TypeUtilsMutable<IncomingSendQueryRequest> {
  const mockClass = IncomingSendQueryRequest.fromProps({
    query: mockQuery,
    enhancePromptRounds: 3,
    enhanceResultRounds: 2,
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
function buildMockSaveWorkflowClient_succeeds(value?: unknown): ISaveWorkflowClient {
  const mockWorkflow: WorkflowProps = {
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    steps: [],
  }
  Object.setPrototypeOf(mockWorkflow, Workflow.prototype)
  const mockResult = Result.makeSuccess(value ?? mockWorkflow)
  return { save: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockSaveWorkflowClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): ISaveWorkflowClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { save: jest.fn().mockResolvedValue(mockFailure) }
}

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

describe(`Workflow Service SendQueryApi SendQueryApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingSendQueryRequest edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingSendQueryRequest is valid`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequest is undefined`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const mockTestRequest = undefined as never
    const result = await sendQueryApiService.sendQuery(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequest is null`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const mockTestRequest = null as never
    const result = await sendQueryApiService.sendQuery(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequest is not an instance of the class`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const mockTestRequest = { ...mockIncomingRequest }
    const result = await sendQueryApiService.sendQuery(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test when it creates the Workflow
   ************************************************************/
  it(`returns a Failure if the Workflow.fromInstructions returns a Failure`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(Workflow, 'fromInstructions').mockReturnValueOnce(expectedResult)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls SaveWorkflowClient.save a single time`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    await sendQueryApiService.sendQuery(mockIncomingRequest)
    expect(mockSaveWorkflowClient.save).toHaveBeenCalledTimes(1)
  })

  it(`calls SaveWorkflowClient.save with the expected input`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    await sendQueryApiService.sendQuery(mockIncomingRequest)
    expect(mockSaveWorkflowClient.save).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowId: expect.any(String),
        instructions: {
          query: mockQuery,
          enhancePromptRounds: mockEnhancePromptRounds,
          enhanceResultRounds: mockEnhanceResultRounds,
        },
      }),
    )
  })

  it(`propagates the Failure if SaveWorkflowClient.save returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_fails(mockFailureKind, mockError, mockTransient)
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test when it publishes the WorkflowCreatedEvent
   ************************************************************/
  it(`propagates the Failure if WorkflowCreatedEvent.fromData returns a Failure`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(WorkflowCreatedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    await sendQueryApiService.sendQuery(mockIncomingRequest)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected input`, async () => {
    // Mock KSUID to return a fixed workflowId
    jest.spyOn(KSUID, 'randomSync').mockReturnValue({
      string: mockWorkflowId,
    } as never)

    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    await sendQueryApiService.sendQuery(mockIncomingRequest)
    const mockWorkflowCreatedEventInput: WorkflowCreatedEventData = {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKey,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    }
    const expectedWorkflowCreatedEventResult = WorkflowCreatedEvent.fromData(mockWorkflowCreatedEventInput)
    const expectedWorkflowCreatedEvent = Result.getSuccessValueOrThrow(expectedWorkflowCreatedEventResult)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowCreatedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockEventStoreClient = buildMockEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
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
  it(`returns the expected Success<SendQueryApiServiceOutput> if
      EventStoreClient.publish returns a Failure of kind DuplicateEventError`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_fails('DuplicateEventError')
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
    const expectedOutput: SendQueryApiServiceOutput = {
      query: mockIncomingRequest.query,
      enhancePromptRounds: mockIncomingRequest.enhancePromptRounds,
      enhanceResultRounds: mockIncomingRequest.enhanceResultRounds,
      workflowId: mockWorkflowId,
      objectKey: mockObjectKey,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<SendQueryApiServiceOutput> if the execution path is
      successful`, async () => {
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const sendQueryApiService = new SendQueryApiService(mockSaveWorkflowClient, mockEventStoreClient)
    const result = await sendQueryApiService.sendQuery(mockIncomingRequest)
    const expectedOutput: SendQueryApiServiceOutput = {
      query: mockIncomingRequest.query,
      enhancePromptRounds: mockIncomingRequest.enhancePromptRounds,
      enhanceResultRounds: mockIncomingRequest.enhanceResultRounds,
      workflowId: mockWorkflowId,
      objectKey: mockObjectKey,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
