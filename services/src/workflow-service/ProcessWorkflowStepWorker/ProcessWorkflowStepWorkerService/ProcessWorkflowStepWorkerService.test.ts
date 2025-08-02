import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Agent } from '../../agents/Agent'
import { WorkflowAgentsDeployedEvent } from '../../events/WorkflowAgentsDeployedEvent'
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

const mockAgents: Agent[] = [
  {
    role: 'mockAgentRole-1',
    name: 'mockAgentName-1',
    directive: 'mockAgentDirective-1',
    system: 'mockAgentSystem-1',
    prompt: 'mockAgentPrompt-1',
    phaseName: 'mockPhaseName-1',
  },
  {
    role: 'mockAgentRole-2',
    name: 'mockAgentName-2',
    directive: 'mockAgentDirective-2',
    system: 'mockAgentSystem-2',
    prompt: 'mockAgentPrompt-2',
    phaseName: 'mockPhaseName-2',
  },
  {
    role: 'mockAgentRole-3',
    name: 'mockAgentName-3',
    directive: 'mockAgentDirective-3',
    system: 'mockAgentSystem-3',
    prompt: 'mockAgentPrompt-3',
    phaseName: 'mockPhaseName-3',
  },
]

function buildMockWorkflowSteps(): WorkflowStep[] {
  const workflowSteps: WorkflowStep[] = [
    {
      stepId: 'mockStepId-1',
      stepStatus: 'completed',
      executionOrder: 1,
      agent: mockAgents[0],
      llmSystem: mockAgents[0].system,
      llmPrompt: mockAgents[0].prompt,
      llmResult: 'mockLlmResult-1',
    },
    {
      stepId: 'mockStepId-2',
      stepStatus: 'pending',
      executionOrder: 2,
      agent: mockAgents[1],
      llmSystem: mockAgents[1].system,
      llmPrompt: mockAgents[1].prompt,
      llmResult: 'mockLlmResult-2',
    },
    {
      stepId: 'mockStepId-3',
      stepStatus: 'pending',
      executionOrder: 3,
      agent: mockAgents[2],
      llmSystem: mockAgents[2].system,
      llmPrompt: mockAgents[2].prompt,
      llmResult: '<result>{{PREVIOUS_RESULT}}</result>',
    },
  ]
  return workflowSteps
}

// Mock Workflow.getObjectKey
jest.spyOn(Workflow.prototype, 'getObjectKey').mockReturnValue(mockObjectKeyProduced)

function buildMockIncomingWorkflowAgentsDeployedEvent(): TypeUtilsMutable<WorkflowAgentsDeployedEvent> {
  const mockClass: WorkflowAgentsDeployedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED_EVENT,
    eventData: {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKeyReceived,
    },
    createdAt: mockDate,
  }
  Object.setPrototypeOf(mockClass, WorkflowAgentsDeployedEvent.prototype)
  return mockClass
}

const mockIncomingWorkflowAgentsDeployedEvent = buildMockIncomingWorkflowAgentsDeployedEvent()

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
  const mockAgentsString = value ?? 'mockLlmResult-X'
  return {
    invoke: jest.fn().mockResolvedValue(Result.makeSuccess(mockAgentsString)),
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

describe(`Workflow Service ProcessWorkflowStepWorker ProcessWorkflowStepWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowAgentsDeployedEvent is valid`, async () => {
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowAgentsDeployedEvent is undefined`, async () => {
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
      WorkflowAgentsDeployedEvent is null`, async () => {
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
      WorkflowAgentsDeployedEvent is not an instance of the class`, async () => {
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
    const mockTestEvent = { ...mockIncomingWorkflowAgentsDeployedEvent }
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
  it(`returns a Failure of kind InvalidArgumentsError if Workflow.getCurrentStep includes
      '<result>{{PREVIOUS_RESULT}}</result>' and Workflow.getLastExecutedStep returns null`, async () => {
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
      agent: mockAgents[1],
      llmSystem: mockAgents[1].system,
      llmPrompt: 'Test prompt with <result>{{PREVIOUS_RESULT}}</result>',
      llmResult: '',
    })
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a Failure of kind WorkflowAlreadyCompletedError if Workflow.getCurrentStep returns
      null`, async () => {
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowAlreadyCompletedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a Failure of kind InvalidArgumentsError if Workflow.getCurrentStep includes
      '<result>{{PREVIOUS_RESULT}}</result>' and Workflow.getLastExecutedStep returns null`, async () => {
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
      agent: mockAgents[1],
      llmSystem: mockAgents[1].system,
      llmPrompt: 'Test prompt with <result>{{PREVIOUS_RESULT}}</result>',
      llmResult: '',
    })
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledWith(mockAgents[1].system, mockAgents[1].prompt)
  })

  it(`calls InvokeBedrockClient.invoke with the expected system and prompt replacing
      <result>{{PREVIOUS_RESULT}}</result> with the actual previous LLM result`, async () => {
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
      agent: mockAgents[0],
      llmSystem: mockAgents[0].system,
      llmPrompt: mockAgents[0].prompt,
      llmResult: mockPreviousResult,
    })
    jest.spyOn(Workflow.prototype, 'getCurrentStep').mockReturnValueOnce({
      stepId: 'mockStepId-2',
      stepStatus: 'pending',
      executionOrder: 2,
      agent: mockAgents[1],
      llmSystem: mockAgents[1].system,
      llmPrompt: `Test prompt with <result>{{PREVIOUS_RESULT}}</result>`,
      llmResult: '',
    })
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledWith(
      mockAgents[1].system,
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)

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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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

    await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
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
    const result = await processWorkflowStepWorkerService.processWorkflowStep(mockIncomingWorkflowAgentsDeployedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
