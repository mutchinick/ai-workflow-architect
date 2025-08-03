import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { Assistant } from '../../assistants/Assistant'
import { AssistantsDesignerAssistant } from '../../assistants/AssistantsDesignerAssistant'
import { WorkflowAssistantsDeployedEvent } from '../../events/WorkflowAssistantsDeployedEvent'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IInvokeBedrockClient } from '../../InvokeBedrockClient/InvokeBedrockClient'
import { IReadWorkflowClient } from '../../models/ReadWorkflowClient'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'
import { WorkflowStep } from '../../models/WorkflowStep'
import { DeployWorkflowAssistantsWorkerService } from './DeployWorkflowAssistantsWorkerService'

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
    directive: 'mockAssistantDirective-1',
    system: 'mockAssistantSystem-1',
    prompt: 'mockAssistantPrompt-1',
    phaseName: 'mockPhaseName-1',
  },
  {
    role: 'mockAssistantRole-2',
    name: 'mockAssistantName-2',
    directive: 'mockAssistantDirective-2',
    system: 'mockAssistantSystem-2',
    prompt: 'mockAssistantPrompt-2',
    phaseName: 'mockPhaseName-2',
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
    },
    createdAt: mockDate,
  }
  Object.setPrototypeOf(mockClass, WorkflowCreatedEvent.prototype)
  return mockClass
}

const mockIncomingWorkflowCreatedEvent = buildMockIncomingWorkflowCreatedEvent()

function buildExpectedWorkflowAssistantsDeployedEvent(): TypeUtilsMutable<WorkflowAssistantsDeployedEvent> {
  const mockClass = WorkflowAssistantsDeployedEvent.fromData({
    workflowId: mockWorkflowId,
    objectKey: mockObjectKeyProduced,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedWorkflowAssistantsDeployedEvent = buildExpectedWorkflowAssistantsDeployedEvent()

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
  const mockAssistantsString = value ?? JSON.stringify(mockAssistants)
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

describe(`Workflow Service DeployWorkflowAssistantsWorker
          DeployWorkflowAssistantsWorkerService tests`, () => {
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
    )
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      WorkflowCreatedEvent is undefined`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = undefined as never
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockTestEvent)
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = null as never
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockTestEvent)
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockTestEvent = { ...mockIncomingWorkflowCreatedEvent }
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic deployWorkflowAssistants
   ************************************************************/
  it(`returns a Failure of kind InvalidArgumentsError if Workflow.deployAssistants
      returns a Failure`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    jest
      .spyOn(Workflow.prototype, 'deployAssistants')
      .mockReturnValueOnce(Result.makeFailure(mockFailureKind, mockError, mockTransient))
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
    )
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
    expect(mockReadWorkflowClient.read).toHaveBeenCalledTimes(1)
  })

  it(`calls ReadWorkflowClient.read with the expected objectKey`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledTimes(1)
  })

  it(`calls InvokeBedrockClient.invoke with the expected system and prompt`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
    )
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a Failure of kind UnrecognizedError if InvokeBedrockClient.invoke
      returns an invalid JSON`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds('mockInvalidValue')
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
    )
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
    expect(mockSaveWorkflowClient.save).toHaveBeenCalledTimes(1)
  })

  it(`calls SaveWorkflowClient.save with the expected Workflow`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)

    expect(mockSaveWorkflowClient.save).toHaveBeenCalledWith(expect.any(Workflow))
    const workflow = (mockSaveWorkflowClient.save as jest.Mock).mock.calls[0][0]
    expect(workflow.workflowId).toBe(mockWorkflowId)
    expect(workflow.instructions).toEqual({ query: mockQuery })
    expect(workflow.steps).toBeInstanceOf(Array)
    expect(workflow.steps.length).toBeGreaterThan(0)
    expect(workflow.steps[0]).toEqual(
      expect.objectContaining({
        stepId: expect.any(String),
        stepStatus: 'completed',
        executionOrder: 1,
        assistant: AssistantsDesignerAssistant,
        llmSystem: AssistantsDesignerAssistant.system,
        llmPrompt: expect.stringContaining(`<query>${mockQuery}</query>`),
        llmResult: expect.any(String),
      } as WorkflowStep),
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
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
  it(`propagates the Failure if WorkflowAssistantsDeployedEvent.fromData returns a
      Failure`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )

    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(WorkflowAssistantsDeployedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
    )
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected WorkflowAssistantsDeployedEvent`, async () => {
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(mockIncomingWorkflowCreatedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedWorkflowAssistantsDeployedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockReadWorkflowClient = buildMockReadWorkflowClient_succeeds()
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const mockSaveWorkflowClient = buildMockSaveWorkflowClient_succeeds()
    const mockEventStoreClient = buildEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
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
    const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
      mockReadWorkflowClient,
      mockInvokeBedrockClient,
      mockSaveWorkflowClient,
      mockEventStoreClient,
    )
    const result = await deployWorkflowAssistantsWorkerService.deployWorkflowAssistants(
      mockIncomingWorkflowCreatedEvent,
    )
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
