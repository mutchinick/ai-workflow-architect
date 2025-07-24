import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { WorkflowAgentsDeployedEvent } from '../../events/WorkflowAgentsDeployedEvent'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IInvokeBedrockClient } from '../../InvokeBedrockClient/InvokeBedrockClient'
import { Agent } from '../../models/Agent'
import { IReadWorkflowClient } from '../../models/ReadWorkflowClient'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'
import { DeployWorkflowAgentsWorkerService } from './DeployWorkflowAgentsWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockWorkflowId = 'mockWorkflowId'
const mockObjectKeyReceived = 'mockObjectKeyReceived'
const mockObjectKeyProduced = 'mockObjectKeyProduced'
const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 2
const mockEnhanceResultRounds = 1

const mockAgents: Agent[] = [
  {
    role: 'mockAgentRole-1',
    name: 'mockAgentName-1',
    directive: 'mockAgentDirective-1',
  },
  {
    role: 'mockAgentRole-2',
    name: 'mockAgentName-2',
    directive: 'mockAgentDirective-2',
  },
]

// Mock Workflow.getObjectKey
jest.spyOn(Workflow.prototype, 'getObjectKey').mockReturnValue(mockObjectKeyProduced)

function buildMockIncomingWorkflowCreatedEvent(): TypeUtilsMutable<WorkflowCreatedEvent> {
  const mockClass: WorkflowCreatedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_CREATED_EVENT,
    eventData: {
      workflowId: mockWorkflowId,
      objectKey: mockObjectKeyReceived,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    createdAt: mockDate,
  }
  Object.setPrototypeOf(mockClass, WorkflowCreatedEvent.prototype)
  return mockClass
}

const mockIncomingWorkflowCreatedEvent = buildMockIncomingWorkflowCreatedEvent()

function buildExpectedWorkflowAgentsDeployedEvent(): TypeUtilsMutable<WorkflowAgentsDeployedEvent> {
  const mockClass = WorkflowAgentsDeployedEvent.fromData({
    workflowId: mockWorkflowId,
    objectKey: mockObjectKeyProduced,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedWorkflowAgentsDeployedEvent = buildExpectedWorkflowAgentsDeployedEvent()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockReadWorkflowClient_succeeds(): IReadWorkflowClient {
  const mockWorkflowResult = Workflow.fromProps({
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    steps: [],
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
  const mockAgentsString = value ?? JSON.stringify(mockAgents)
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

describe(`Workflow Service DeployWorkflowAgentsWorker DeployWorkflowAgentsWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input WorkflowCreatedEvent is valid`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEvent is undefined`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = undefined as never
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEvent is null`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = null as never
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEvent is not an instance of the class`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = { ...mockIncomingWorkflowCreatedEvent }
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic deployWorkflowAgents
   ************************************************************/
  it(`returns a Failure of kind InvalidArgumentsError if Workflow.deployAgents returns a Failure`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    jest
      .spyOn(Workflow.prototype, 'deployAgents')
      .mockReturnValueOnce(Result.makeFailure(mockFailureKind, mockError, mockTransient))
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
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
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(mockReadWorkflowClient.read).toHaveBeenCalledTimes(1)
  })

  it(`calls ReadWorkflowClient.read with the expected objectKey`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
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
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
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
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledTimes(1)
  })

  it(`calls InvokeBedrockClient.invoke with the expected system and prompt`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledWith(
      expect.any(String), // system
      expect.stringContaining(mockQuery),
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
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Failure of kind UnrecognizedError if InvokeBedrockClient.invoke returns an invalid JSON`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds('mockInvalidValue')
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
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
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(mockSaveWorkflowClient.save).toHaveBeenCalledTimes(1)
  })

  it(`calls SaveWorkflowClient.save with the expected Workflow`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)

    expect(mockSaveWorkflowClient.save).toHaveBeenCalledWith(expect.any(Workflow))
    const workflow = (mockSaveWorkflowClient.save as jest.Mock).mock.calls[0][0]
    expect(workflow.workflowId).toBe(mockWorkflowId)
    expect(workflow.instructions).toEqual({
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    })
    expect(workflow.steps).toBeInstanceOf(Array)
    expect(workflow.steps.length).toBeGreaterThan(0)
    expect(workflow.steps[0]).toEqual(
      expect.objectContaining({
        stepId: expect.any(String),
        stepStatus: 'completed',
        stepType: 'deploy_agents',
        executionOrder: 1,
        round: 1,
        prompt: expect.any(String),
        agents: mockAgents,
      }),
    )
  })

  it(`propagates the Failure if SaveWorkflowClient.save returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_fails(mockFailureKind, mockError, mockTransient)
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
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
  it(`propagates the Failure if WorkflowAgentsDeployedEvent.fromData returns a Failure`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )

    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(WorkflowAgentsDeployedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected WorkflowAgentsDeployedEvent`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowAgentsDeployedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
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
    const deployWorkflowAgentsWorkerService = new DeployWorkflowAgentsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAgentsWorkerService.deployWorkflowAgents(mockIncomingWorkflowCreatedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
