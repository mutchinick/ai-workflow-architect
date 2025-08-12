import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Assistant } from '../../assistants/Assistant'
import { WorkflowAssistantsDeployedEvent } from '../../events/WorkflowAssistantsDeployedEvent'
import { WorkflowCompletedEvent } from '../../events/WorkflowCompletedEvent'
import { WorkflowStepProcessedEvent } from '../../events/WorkflowStepProcessedEvent'
import { IInvokeBedrockClient } from '../../InvokeBedrockClient/InvokeBedrockClient'
import { IReadWorkflowClient } from '../../models/ReadWorkflowClient'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'
import { WorkflowStep } from '../../models/WorkflowStep'
import { ProcessWorkflowStepWorkerService } from './ProcessWorkflowStepWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKeyReceived = 'mockObjectKeyReceived'
const mockObjectKeyProduced = 'mockObjectKeyProduced'
const mockQuery = 'mockQuery'

const mockAssistants: Assistant[] = [
  {
    role: 'mockAssistantRole-1',
    name: 'mockAssistantName-1',
    system: 'mockAssistantSystem-1',
    prompt: 'mockAssistantPrompt-1',
    phaseName: 'mockPhaseName-1',
  },
  {
    role: 'mockAssistantRole-2',
    name: 'mockAssistantName-2',
    system: 'mockAssistantSystem-2',
    prompt: 'mockAssistantPrompt-2',
    phaseName: 'mockPhaseName-2',
  },
  {
    role: 'mockAssistantRole-3',
    name: 'mockAssistantName-3',
    system: 'mockAssistantSystem-3',
    prompt: 'mockAssistantPrompt-3',
    phaseName: 'mockPhaseName-3',
  },
]

function buildMockWorkflowSteps(): WorkflowStep[] {
  const workflowSteps: WorkflowStep[] = [
    {
      stepId: 'mockStepId-1',
      stepStatus: 'completed',
      executionOrder: 1,
      assistant: mockAssistants[0],
      llmSystem: mockAssistants[0].system,
      llmPrompt: mockAssistants[0].prompt,
      llmResult: 'mockLlmResult-1',
    },
    {
      stepId: 'mockStepId-2',
      stepStatus: 'pending',
      executionOrder: 2,
      assistant: mockAssistants[1],
      llmSystem: mockAssistants[1].system,
      llmPrompt: mockAssistants[1].prompt,
      llmResult: 'mockLlmResult-2',
    },
    {
      stepId: 'mockStepId-3',
      stepStatus: 'pending',
      executionOrder: 3,
      assistant: mockAssistants[2],
      llmSystem: mockAssistants[2].system,
      llmPrompt: mockAssistants[2].prompt,
      llmResult: '<PREVIOUS_RESULT>',
    },
  ]
  return workflowSteps
}

// Mock Workflow.getObjectKey
jest.spyOn(Workflow.prototype, 'getObjectKey').mockReturnValue(mockObjectKeyProduced)

function buildMockIncomingWorkflowAssistantsDeployedEvent(): TypeUtilsMutable<WorkflowAssistantsDeployedEvent> {
  const mockClass: WorkflowAssistantsDeployedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_ASSISTANTS_DEPLOYED_EVENT,
    eventData: {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKeyReceived,
    },
    createdAt: mockDate,
  }
  Object.setPrototypeOf(mockClass, WorkflowAssistantsDeployedEvent.prototype)
  return mockClass
}

const mockIncomingWorkflowAssistantsDeployedEvent = buildMockIncomingWorkflowAssistantsDeployedEvent()

function buildExpectedWorkflowStepProcessedEvent(): TypeUtilsMutable<WorkflowStepProcessedEvent> {
  const mockClass = WorkflowStepProcessedEvent.fromData({
    workflowId: mockWorkflowId,
    objectKey: mockObjectKeyProduced,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedWorkflowStepProcessedEvent = buildExpectedWorkflowStepProcessedEvent()

function buildExpectedWorkflowCompletedEvent(): TypeUtilsMutable<WorkflowCompletedEvent> {
  const mockClass = WorkflowCompletedEvent.fromData({
    workflowId: mockWorkflowId,
    objectKey: mockObjectKeyProduced,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedWorkflowCompletedEvent = buildExpectedWorkflowCompletedEvent()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockReadWorkflowClient_succeeds(value?: WorkflowStep[]): IReadWorkflowClient {
  const mockSteps = value ?? buildMockWorkflowSteps()
  const mockWorkflowResult = Workflow.fromProps({
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
    },
    steps: mockSteps,
  })
  const workflow = Result.getSuccessValueOrThrow(mockWorkflowResult)
  return {
    read: jest.fn().mockResolvedValue(Result.makeSuccess(workflow)),
  }
}

function buildMockReadWorkflowClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IReadWorkflowClient {
  return {
    read: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockInvokeBedrockClient_succeeds(value?: unknown): IInvokeBedrockClient {
  const mockAssistantsString = value ?? 'mockLlmResult-X'
  return {
    invoke: jest.fn().mockResolvedValue(Result.makeSuccess(mockAssistantsString)),
  }
}

function buildMockInvokeBedrockClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IInvokeBedrockClient {
  return {
    invoke: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

function buildMockSaveWorkflowClient_succeeds(): ISaveWorkflowClient {
  return {
    save: jest.fn().mockResolvedValue(Result.makeSuccess()),
  }
}

function buildMockSaveWorkflowClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): ISaveWorkflowClient {
  return {
    save: jest
      .fn()
      .mockResolvedValue(
        Result.makeFailure(failureKind ?? 'UnrecognizedError', error ?? 'UnrecognizedError', transient ?? false),
      ),
  }
}

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

describe(`Workflow Service ProcessWorkflowStepWorker ProcessWorkflowStepWorkerService
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowAssistantsDeployedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowAssistantsDeployedEvent is valid`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAssistantsDeployedEvent is undefined`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = undefined as never
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAssistantsDeployedEvent is null`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = null as never
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAssistantsDeployedEvent is not an instance of the class`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = { ...mockIncomingWorkflowAssistantsDeployedEvent }
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic processWorkflowStep
   ************************************************************/
  it(`returns a Failure of kind WorkflowInvalidStateError if Workflow.getCurrentStep
      includes '<PREVIOUS_RESULT>' and Workflow.getLastExecutedStep returns null`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    jest.spyOn(Workflow.prototype, 'getLastExecutedStep').mockReturnValueOnce(null)
    jest.spyOn(Workflow.prototype, 'getCurrentStep').mockReturnValueOnce({
      stepId: 'mockStepId-2',
      stepStatus: 'pending',
      executionOrder: 2,
      assistant: mockAssistants[1],
      llmSystem: mockAssistants[1].system,
      llmPrompt: 'Test prompt with <PREVIOUS_RESULT>',
      llmResult: '',
    })
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowInvalidStateError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a Failure of kind WorkflowAlreadyCompletedError if
      Workflow.getCurrentStep returns null`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    jest.spyOn(Workflow.prototype, 'getCurrentStep').mockReturnValueOnce(null)
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowAlreadyCompletedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a Failure of kind WorkflowInvalidStateError if Workflow.getCurrentStep
      includes '<PREVIOUS_RESULT>' and Workflow.getLastExecutedStep returns null`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    jest.spyOn(Workflow.prototype, 'getLastExecutedStep').mockReturnValueOnce(null)
    jest.spyOn(Workflow.prototype, 'getCurrentStep').mockReturnValueOnce({
      stepId: 'mockStepId-2',
      stepStatus: 'pending',
      executionOrder: 2,
      assistant: mockAssistants[1],
      llmSystem: mockAssistants[1].system,
      llmPrompt: 'Test prompt with <PREVIOUS_RESULT>',
      llmResult: '',
    })
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowInvalidStateError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic ReadWorkflowClient.read
   ************************************************************/
  it(`calls ReadWorkflowClient.read a single time`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockReadWorkflowClient.read).toHaveBeenCalledTimes(1)
  })

  it(`calls ReadWorkflowClient.read with the expected objectKey`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockReadWorkflowClient.read).toHaveBeenCalledWith(mockObjectKeyReceived)
  })

  it(`propagates the Failure if ReadWorkflowClient.read returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_fails(mockFailureKind, mockError, mockTransient)
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic InvokeBedrockClient.invoke
   ************************************************************/
  it(`calls InvokeBedrockClient.invoke a single time`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledTimes(1)
  })

  it(`calls InvokeBedrockClient.invoke with the expected system and prompt`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledWith(mockAssistants[1].system, mockAssistants[1].prompt)
  })

  it(`calls InvokeBedrockClient.invoke with the expected system and prompt replacing
      <PREVIOUS_RESULT> with the actual previous LLM result`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockPreviousResult = 'mockLlmResult-Y'
    jest.spyOn(Workflow.prototype, 'getLastExecutedStep').mockReturnValueOnce({
      stepId: 'mockStepId-1',
      stepStatus: 'completed',
      executionOrder: 1,
      assistant: mockAssistants[0],
      llmSystem: mockAssistants[0].system,
      llmPrompt: mockAssistants[0].prompt,
      llmResult: mockPreviousResult,
    })
    jest.spyOn(Workflow.prototype, 'getCurrentStep').mockReturnValueOnce({
      stepId: 'mockStepId-2',
      stepStatus: 'pending',
      executionOrder: 2,
      assistant: mockAssistants[1],
      llmSystem: mockAssistants[1].system,
      llmPrompt: `Test prompt with <PREVIOUS_RESULT>`,
      llmResult: '',
    })
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledWith(
      mockAssistants[1].system,
      `Test prompt with ${mockPreviousResult}`,
    )
  })

  it(`propagates the Failure if InvokeBedrockClient.invoke returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_fails(mockFailureKind, mockError, mockTransient)
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic if Workflow.completeStep returns a Failure
   ************************************************************/
  it(`propagates the Failure if Workflow.completeStep returns a failure`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    jest
      .spyOn(Workflow.prototype, 'completeStep')
      .mockReturnValueOnce(Result.makeFailure(mockFailureKind, mockError, mockTransient))
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic SaveWorkflowClient.save
   ************************************************************/
  it(`calls SaveWorkflowClient.save a single time`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockSaveWorkflowClient.save).toHaveBeenCalledTimes(1)
  })

  it(`calls SaveWorkflowClient.save with the expected Workflow`, async () => {
    const mockLlmResult = 'mockLlmResult-123'
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds(mockLlmResult)
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)

    expect(mockSaveWorkflowClient.save).toHaveBeenCalledWith(expect.any(Workflow))
    const workflow = (mockSaveWorkflowClient.save as jest.Mock).mock.calls[0][0]
    expect(workflow.workflowId).toBe(mockWorkflowId)
    expect(workflow.instructions).toEqual({ query: mockQuery })
    expect(workflow.steps).toBeInstanceOf(Array)
    expect(workflow.steps.length).toBeGreaterThan(0)
    const expectedSteps = buildMockWorkflowSteps()
    expectedSteps[1].llmResult = mockLlmResult
    expectedSteps[1].stepStatus = 'completed'
    expect(workflow.steps).toStrictEqual(expectedSteps)
  })

  it(`propagates the Failure if SaveWorkflowClient.save returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_fails(mockFailureKind, mockError, mockTransient)
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic EventStoreClient.publish
   ************************************************************/
  it(`propagates the Failure if WorkflowStepProcessedEvent.fromData returns a Failure`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )

    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(WorkflowStepProcessedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected WorkflowStepProcessedEvent`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowStepProcessedEvent)
  })

  it(`calls EventStoreClient.publish with the expected WorkflowCompletedEvent if the
      workflow has completed`, async () => {
    const mockSteps = buildMockWorkflowSteps()
    mockSteps[1].stepStatus = 'completed'
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds(mockSteps)
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )

    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAssistantsDeployedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowCompletedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
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
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await processWorkflowStepWorkerService.processWorkflowStep(
      mockIncomingWorkflowAssistantsDeployedEvent,
    )
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
