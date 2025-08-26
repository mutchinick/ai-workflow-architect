import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IReadLatestWorkflowClient } from '../../models/ReadLatestWorkflowClient'
import { Workflow, WorkflowProps } from '../../models/Workflow'
import { IncomingGetLatestWorkflowRequest } from '../IncomingGetLatestWorkflowRequest/IncomingGetLatestWorkflowRequest'
import { GetLatestWorkflowApiService, GetLatestWorkflowApiServiceOutput } from './GetLatestWorkflowApiService'

const mockWorkflowId = 'mockWorkflowId'
const mockQuery = 'mockQuery'

function buildMockIncomingRequest(): TypeUtilsMutable<IncomingGetLatestWorkflowRequest> {
  const mockClass = IncomingGetLatestWorkflowRequest.fromProps({
    workflowId: mockWorkflowId,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingRequest = buildMockIncomingRequest()

function buildMockWorkflowProps(): WorkflowProps {
  return {
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
    },
    steps: [
      {
        stepId: 'mockStepId-1',
        stepStatus: 'completed',
        executionOrder: 1,
        assistant: {
          name: 'mockAssistantName-1',
          role: 'mockAssistantRole-1',
          system: 'mockAssistantSystem-1',
          prompt: 'mockAssistantPrompt-1',
          phaseName: 'mockPhaseName-1',
        },
        llmSystem: 'mockLlmSystem-1',
        llmPrompt: 'mockLlmPrompt-1',
        llmResult: 'mockLlmResult-1',
      },
      {
        stepId: 'mockStepId-2',
        stepStatus: 'completed',
        executionOrder: 2,
        assistant: {
          name: 'mockAssistantName-2',
          role: 'mockAssistantRole-2',
          system: 'mockAssistantSystem-2',
          prompt: 'mockAssistantPrompt-2',
          phaseName: 'mockPhaseName-2',
        },
        llmSystem: 'mockLlmSystem-2',
        llmPrompt: 'mockLlmPrompt-2',
        llmResult: 'mockLlmResult-2',
      },
      {
        stepId: 'mockStepId-3',
        stepStatus: 'pending',
        executionOrder: 3,
        assistant: {
          name: 'mockAssistantName-3',
          role: 'mockAssistantRole-3',
          system: 'mockAssistantSystem-3',
          prompt: 'mockAssistantPrompt-3',
          phaseName: 'mockPhaseName-3',
        },
        llmSystem: 'mockLlmSystem-3',
        llmPrompt: '<PREVIOUS_RESULT>',
        llmResult: '',
      },
    ],
  }
}

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockReadLatestWorkflowClient_succeeds(value?: unknown): IReadLatestWorkflowClient {
  const mockWorkflow = buildMockWorkflowProps()
  Object.setPrototypeOf(mockWorkflow, Workflow.prototype)
  const mockResult = Result.makeSuccess(value ?? mockWorkflow)
  return { readLatest: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockReadLatestWorkflowClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IReadLatestWorkflowClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { readLatest: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Workflow Service GetLatestWorkflowApi GetLatestWorkflowApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingGetLatestWorkflowRequest edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingGetLatestWorkflowRequest is valid`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    const result = await getLatestWorkflowApiService.getLatestWorkflow(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequest is undefined`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    const mockTestRequest = undefined as never
    const result = await getLatestWorkflowApiService.getLatestWorkflow(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequest is null`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    const mockTestRequest = null as never
    const result = await getLatestWorkflowApiService.getLatestWorkflow(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequest is not an instance of the class`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    const mockTestRequest = { ...mockIncomingRequest }
    const result = await getLatestWorkflowApiService.getLatestWorkflow(mockTestRequest)
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
  it(`calls ReadLatestWorkflowClient.readLatest a single time`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    await getLatestWorkflowApiService.getLatestWorkflow(mockIncomingRequest)
    expect(mockReadLatestWorkflowClient.readLatest).toHaveBeenCalledTimes(1)
  })

  it(`calls ReadLatestWorkflowClient.readLatest with the expected input`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    await getLatestWorkflowApiService.getLatestWorkflow(mockIncomingRequest)
    expect(mockReadLatestWorkflowClient.readLatest).toHaveBeenCalledWith(mockIncomingRequest.workflowId)
  })

  it(`propagates the Failure if ReadLatestWorkflowClient.readLatest returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_fails(
      mockFailureKind,
      mockError,
      mockTransient,
    )
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    const result = await getLatestWorkflowApiService.getLatestWorkflow(mockIncomingRequest)
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
  it(`returns the expected Success<GetLatestWorkflowApiServiceOutput> if the execution path is
      successful`, async () => {
    const mockReadLatestWorkflowClient = buildMockReadLatestWorkflowClient_succeeds()
    const getLatestWorkflowApiService = new GetLatestWorkflowApiService(mockReadLatestWorkflowClient)
    const result = await getLatestWorkflowApiService.getLatestWorkflow(mockIncomingRequest)
    const expectedWorkflowProps = buildMockWorkflowProps()
    const expectedOutput: GetLatestWorkflowApiServiceOutput = expectedWorkflowProps
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
