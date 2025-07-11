import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../../errors/Result'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { WorkflowStartedEvent } from '../../../events/WorkflowStartedEvent'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IContinueWorkflowWorkerService } from '../ContinueWorkflowWorkerService/ContinueWorkflowWorkerService'
import { ContinueWorkflowWorkerController } from './ContinueWorkflowWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockWorkflowId = 'mockWorkflowId'
const mockStarted = true

function buildMockWorkflowStartedEvent(id: string): TypeUtilsMutable<WorkflowStartedEvent> {
  const incomingWorkflowStartedEvent: WorkflowStartedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_STARTED,
    eventData: {
      workflowId: `${mockWorkflowId}-${id}`,
      started: mockStarted,
    },
    createdAt: mockDate,
  }
  return incomingWorkflowStartedEvent
}

function buildMockWorkflowStartedEvents(ids: string[]): TypeUtilsMutable<WorkflowStartedEvent>[] {
  return ids.map((id) => buildMockWorkflowStartedEvent(id))
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockEventBridgeEvent(
  id: string,
  incomingWorkflowStartedEvent: WorkflowStartedEvent,
): EventBridgeEvent<string, MockEventDetail> {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: `mockId-${id}`,
    region: 'mockRegion',
    resources: [],
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
        NewImage: marshall(incomingWorkflowStartedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBridgeEvents(
  ids: string[],
  incomingWorkflowStartedEvents: WorkflowStartedEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingWorkflowStartedEvents[index]))
}

function buildMockSqsRecord(id: string, eventBridgeEvent: EventBridgeEvent<string, MockEventDetail>): SQSRecord {
  return {
    messageId: `mockMessageId-${id}`,
    body: JSON.stringify(eventBridgeEvent),
  } as unknown as SQSRecord
}

function buildMockSqsRecords(
  ids: string[],
  eventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[],
): SQSRecord[] {
  return ids.map((id, index) => buildMockSqsRecord(id, eventBridgeEvents[index]))
}

function buildMockSqsEvent(sqsRecords: SQSRecord[]): SQSEvent {
  return { Records: sqsRecords }
}

function buildMockTestObjects(ids: string[]): {
  mockWorkflowStartedEvents: TypeUtilsMutable<WorkflowStartedEvent>[]
  mockEventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockWorkflowStartedEvents = buildMockWorkflowStartedEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockWorkflowStartedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockWorkflowStartedEvents,
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
function buildMockContinueWorkflowWorkerService_succeeds(): IContinueWorkflowWorkerService {
  return { continueWorkflow: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockContinueWorkflowWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IContinueWorkflowWorkerService {
  return {
    continueWorkflow: jest.fn().mockImplementation((incomingWorkflowStartedEvent: WorkflowStartedEvent) => {
      const shouldFail = Object.values(incomingWorkflowStartedEvent.eventData).reduce(
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

describe(`Workflow Service ContinueWorkflowWorker ContinueWorkflowWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSEvent is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = undefined as never
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = undefined as never
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSEvent is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = null as never
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = null as never
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSEvent records are missing`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = {} as never
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = {} as never
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSEvent records are undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined as never)
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined as never)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSEvent records are null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null as never)
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null as never)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSEvent records are empty`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSRecord.body is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSRecord.body is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      SQSRecord.body is not a valid JSON`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent is invalid`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = 'mockInvalidValue' as unknown as WorkflowStartedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent is invalid`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = 'mockInvalidValue' as unknown as WorkflowStartedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent.eventName edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.eventName is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent.eventName is
      undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.eventName is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent.eventName is
      null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.createdAt is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent.createdAt is
      undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.createdAt is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent.createdAt is
      null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent.eventData edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.eventData is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent.eventData is
      undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.eventData is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowStartedEvent.eventData is
      null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowStartedEvent.eventData.workflowId edge cases
   ************************************************************/
  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.eventData.workflowId is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowStartedEvent.eventData.workflowId is undefined`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ContinueWorkflowWorkerService.continueWorkflow if the input
      WorkflowStartedEvent.eventData.workflowId is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowStartedEvent.eventData.workflowId is null`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockId = 'AA'
    const mockWorkflowStartedEvent = buildMockWorkflowStartedEvent(mockId)
    mockWorkflowStartedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowStartedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ContinueWorkflowWorkerService.continueWorkflow a single time for an
      SQSEvent with a single record`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).toHaveBeenCalledTimes(1)
  })

  it(`calls ContinueWorkflowWorkerService.continueWorkflow a multiple times for an
      SQSEvent with a multiple records`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls ContinueWorkflowWorkerService.continueWorkflow with the expected input`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockWorkflowStartedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    expect(mockContinueWorkflowWorkerService.continueWorkflow).toHaveBeenNthCalledWith(1, mockWorkflowStartedEvents[0])
    expect(mockContinueWorkflowWorkerService.continueWorkflow).toHaveBeenNthCalledWith(2, mockWorkflowStartedEvents[1])
    expect(mockContinueWorkflowWorkerService.continueWorkflow).toHaveBeenNthCalledWith(3, mockWorkflowStartedEvents[2])
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the ContinueWorkflowWorkerService returns no
      Failure`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_succeeds()
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ContinueWorkflowWorkerService returns a
      non-transient Failure (test 1)`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: false })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ContinueWorkflowWorkerService returns a
      non-transient Failure (test 2)`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: false })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ContinueWorkflowWorkerService returns a
      non-transient Failure (test 3)`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: false })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ContinueWorkflowWorkerService
      returns a transient Failure (test 1)`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: true })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ContinueWorkflowWorkerService
      returns a transient Failure (test 2)`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: true })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ContinueWorkflowWorkerService
      returns a transient Failure (test 3)`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: true })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
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

  it(`returns all SQSBatchItemFailures if the ContinueWorkflowWorkerService throws all
      and only transient Failure`, async () => {
    const mockContinueWorkflowWorkerService = buildMockContinueWorkflowWorkerService_failsOnData({ transient: true })
    const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(mockContinueWorkflowWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await continueWorkflowWorkerController.continueWorkflows(mockSqsEvent)
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
