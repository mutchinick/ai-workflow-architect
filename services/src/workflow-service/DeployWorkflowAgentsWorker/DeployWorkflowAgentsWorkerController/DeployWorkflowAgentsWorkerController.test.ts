import { marshall } from '@aws-sdk/util-dynamodb'
import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../../errors/Result'
import { EventStoreEvent } from '../../../event-store/EventStoreEvent'
import { EventStoreEventBuilder, IncomingEventBridgeEvent } from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { WorkflowAgentsDeployedEvent } from '../../events/WorkflowAgentsDeployedEvent'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IDeployWorkflowAgentsWorkerService } from '../DeployWorkflowAgentsWorkerService/DeployWorkflowAgentsWorkerService'
import { DeployWorkflowAgentsWorkerController } from './DeployWorkflowAgentsWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockWorkflowId = 'mockWorkflowId'

function buildMockWorkflowCreatedEvent(id: string): TypeUtilsMutable<EventStoreEvent> {
  const workflowCreatedEvent: WorkflowCreatedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_CREATED_EVENT,
    eventData: {
      workflowId: `${mockWorkflowId}-${id}`,
      objectKey: `mockObjectKey-${id}`,
    },
    createdAt: mockDate,
  }

  const workflowAgentsDeployedEvent: WorkflowAgentsDeployedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED_EVENT,
    eventData: {
      workflowId: `${mockWorkflowId}-${id}`,
      objectKey: `mockObjectKey-${id}`,
    },
    createdAt: mockDate,
  }

  // FIXME: This is a workaround to return either WorkflowAgentsDeployedEvent or WorkflowStepProcessedEvent
  // depending on the test case. Ideally, we should have a more structured way to handle this.
  return Math.random() > 0.5 ? workflowAgentsDeployedEvent : workflowCreatedEvent
}

function buildMockWorkflowCreatedEvents(ids: string[]): TypeUtilsMutable<EventStoreEvent>[] {
  return ids.map((id) => buildMockWorkflowCreatedEvent(id))
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockEventBridgeEvent(id: string, incomingEvent: EventStoreEvent): IncomingEventBridgeEvent {
  const mockEventBridgeEvent: IncomingEventBridgeEvent = {
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: `mockId-${id}`,
    region: 'mockRegion',
    resources: ['mockResource'],
    source: 'mockSource',
    time: 'mockTime',
    version: 'mockVersion',
    detail: {
      awsRegion: 'mockAwsRegion',
      eventID: 'mockEventId',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventVersion: 'mockEventVersion',
      dynamodb: {
        NewImage: marshall(incomingEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBridgeEvents(
  ids: string[],
  incomingWorkflowCreatedEvents: EventStoreEvent[],
): IncomingEventBridgeEvent[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingWorkflowCreatedEvents[index]))
}

function buildMockSqsRecord(id: string, eventBridgeEvent: IncomingEventBridgeEvent): SQSRecord {
  return {
    messageId: `mockMessageId-${id}`,
    body: JSON.stringify(eventBridgeEvent),
  } as unknown as SQSRecord
}

function buildMockSqsRecords(ids: string[], eventBridgeEvents: IncomingEventBridgeEvent[]): SQSRecord[] {
  return ids.map((id, index) => buildMockSqsRecord(id, eventBridgeEvents[index]))
}

function buildMockSqsEvent(sqsRecords: SQSRecord[]): SQSEvent {
  return { Records: sqsRecords }
}

function buildMockTestObjects(ids: string[]): {
  mockWorkflowCreatedEvents: TypeUtilsMutable<EventStoreEvent>[]
  mockEventBridgeEvents: IncomingEventBridgeEvent[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockWorkflowCreatedEvents = buildMockWorkflowCreatedEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockWorkflowCreatedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockWorkflowCreatedEvents,
    mockEventBridgeEvents,
    mockSqsRecords,
    mockSqsEvent,
  }
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockDeployWorkflowAgentsWorkerService_succeeds(): IDeployWorkflowAgentsWorkerService {
  return { deployWorkflowAgents: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockDeployWorkflowAgentsWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IDeployWorkflowAgentsWorkerService {
  return {
    deployWorkflowAgents: jest.fn().mockImplementation((incomingWorkflowCreatedEvent: WorkflowCreatedEvent) => {
      const shouldFail = Object.values(incomingWorkflowCreatedEvent.eventData).reduce(
        (acc, cur) => (acc = acc || String(cur).endsWith('-FAILURE')),
        false,
      )
      if (shouldFail) {
        const mockFailure = Result.makeFailure('mockFailureKind' as never, 'Error message', transient)
        return Promise.resolve(mockFailure)
      }
      const mockSuccess = Result.makeSuccess()
      return Promise.resolve(mockSuccess)
    }),
  }
}

describe(`Workflow Service DeployWorkflowAgentsWorker DeployWorkflowAgentsWorkerController
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input SQSEvent is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = undefined as never
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = undefined as never
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input SQSEvent is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = null as never
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = null as never
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input SQSEvent records are missing`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = {} as never
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are missing`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = {} as never
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined as never)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null as never)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input SQSRecord.body is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input SQSRecord.body is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input SQSRecord.body is not a valid JSON`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent is invalid`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = 'mockInvalidValue' as unknown as WorkflowCreatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent is invalid`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = 'mockInvalidValue' as unknown as WorkflowCreatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent is not an instance of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent is not an
      instance of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.eventName edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.eventName is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventName is
      undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.eventName is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventName is
      null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.createdAt edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.createdAt is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.createdAt is
      undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.createdAt is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.createdAt is
      null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.eventData edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.eventData is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventData is
      undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.eventData is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventData is
      null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.eventData.workflowId edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.eventData.workflowId is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowCreatedEvent.eventData.workflowId is undefined`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAgentsWorkerService.deployWorkflowAgents if the
      input WorkflowCreatedEvent.eventData.workflowId is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowCreatedEvent.eventData.workflowId is null`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls DeployWorkflowAgentsWorkerService.deployWorkflowAgents a single time for
      an SQSEvent with a single record`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).toHaveBeenCalledTimes(1)
  })

  it(`calls DeployWorkflowAgentsWorkerService.deployWorkflowAgents a multiple times
      for an SQSEvent with a multiple records`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls DeployWorkflowAgentsWorkerService.deployWorkflowAgents with the expected
      input`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockWorkflowCreatedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).toHaveBeenNthCalledWith(
      1,
      mockWorkflowCreatedEvents[0],
    )
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).toHaveBeenNthCalledWith(
      2,
      mockWorkflowCreatedEvents[1],
    )
    expect(mockDeployWorkflowAgentsWorkerService.deployWorkflowAgents).toHaveBeenNthCalledWith(
      3,
      mockWorkflowCreatedEvents[2],
    )
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService returns
      no Failure`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_succeeds()
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService returns
      a non-transient Failure (test 1)`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: false,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService returns
      a non-transient Failure (test 2)`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: false,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService returns
      a non-transient Failure (test 3)`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: false,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService
      returns a transient Failure (test 1)`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService
      returns a transient Failure (test 2)`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService
      returns a transient Failure (test 3)`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
        { itemIdentifier: mockSqsRecords[3].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns all SQSBatchItemFailures if the DeployWorkflowAgentsWorkerService throws
      all and only transient Failure`, async () => {
    const mockDeployWorkflowAgentsWorkerService = buildMockDeployWorkflowAgentsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAgentsWorkerController = new DeployWorkflowAgentsWorkerController(
      mockDeployWorkflowAgentsWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAgentsWorkerController.deployWorkflowAgents(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })
})
