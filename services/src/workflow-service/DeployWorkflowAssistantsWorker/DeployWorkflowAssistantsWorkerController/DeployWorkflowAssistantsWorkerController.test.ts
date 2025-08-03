import { marshall } from '@aws-sdk/util-dynamodb'
import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../../errors/Result'
import { EventStoreEvent } from '../../../event-store/EventStoreEvent'
import { EventStoreEventBuilder, IncomingEventBridgeEvent } from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IDeployWorkflowAssistantsWorkerService } from '../DeployWorkflowAssistantsWorkerService/DeployWorkflowAssistantsWorkerService'
import { DeployWorkflowAssistantsWorkerController } from './DeployWorkflowAssistantsWorkerController'

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
  return workflowCreatedEvent
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
function buildMockDeployWorkflowAssistantsWorkerService_succeeds(): IDeployWorkflowAssistantsWorkerService {
  return { deployWorkflowAssistants: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IDeployWorkflowAssistantsWorkerService {
  return {
    deployWorkflowAssistants: jest.fn().mockImplementation((incomingWorkflowCreatedEvent: WorkflowCreatedEvent) => {
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

describe(`Workflow Service DeployWorkflowAssistantsWorker
          DeployWorkflowAssistantsWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input SQSEvent is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = undefined as never
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = undefined as never
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input SQSEvent is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = null as never
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = null as never
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input SQSEvent records are missing`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = {} as never
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are missing`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = {} as never
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined as never)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null as never)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input SQSRecord.body is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input SQSRecord.body is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input SQSRecord.body is not a valid JSON`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent is invalid`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = 'mockInvalidValue' as unknown as WorkflowCreatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent is invalid`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = 'mockInvalidValue' as unknown as WorkflowCreatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent is not an instance of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
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

    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.eventName edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.eventName is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventName is
      undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.eventName is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventName is
      null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.createdAt edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.createdAt is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.createdAt is
      undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.createdAt is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.createdAt is
      null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.eventData edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.eventData is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventData is
      undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.eventData is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowCreatedEvent.eventData is
      null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowCreatedEvent.eventData.workflowId edge cases
   ************************************************************/
  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.eventData.workflowId is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowCreatedEvent.eventData.workflowId is undefined`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants if
      the input WorkflowCreatedEvent.eventData.workflowId is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowCreatedEvent.eventData.workflowId is null`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowCreatedEvent = buildMockWorkflowCreatedEvent(mockId)
    mockWorkflowCreatedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants a single
      time for an SQSEvent with a single record`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).toHaveBeenCalledTimes(1)
  })

  it(`calls DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants a multiple
      times for an SQSEvent with a multiple records`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).toHaveBeenCalledTimes(
      mockSqsRecords.length,
    )
  })

  it(`calls DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants with the
      expected input`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockWorkflowCreatedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).toHaveBeenNthCalledWith(
      1,
      mockWorkflowCreatedEvents[0],
    )
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).toHaveBeenNthCalledWith(
      2,
      mockWorkflowCreatedEvents[1],
    )
    expect(mockDeployWorkflowAssistantsWorkerService.deployWorkflowAssistants).toHaveBeenNthCalledWith(
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
  it(`returns no SQSBatchItemFailures if the DeployWorkflowAssistantsWorkerService
      returns no Failure`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_succeeds()
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the DeployWorkflowAssistantsWorkerService
      returns a non-transient Failure (test 1)`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: false,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the DeployWorkflowAssistantsWorkerService
      returns a non-transient Failure (test 2)`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: false,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the DeployWorkflowAssistantsWorkerService
      returns a non-transient Failure (test 3)`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: false,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      DeployWorkflowAssistantsWorkerService returns a transient Failure (test 1)`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      DeployWorkflowAssistantsWorkerService returns a transient Failure (test 2)`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the
      DeployWorkflowAssistantsWorkerService returns a transient Failure (test 3)`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
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

  it(`returns all SQSBatchItemFailures if the DeployWorkflowAssistantsWorkerService
      throws all and only transient Failure`, async () => {
    const mockDeployWorkflowAssistantsWorkerService = buildMockDeployWorkflowAssistantsWorkerService_failsOnData({
      transient: true,
    })
    const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
      mockDeployWorkflowAssistantsWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await deployWorkflowAssistantsWorkerController.deployWorkflowAssistants(mockSqsEvent)
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
