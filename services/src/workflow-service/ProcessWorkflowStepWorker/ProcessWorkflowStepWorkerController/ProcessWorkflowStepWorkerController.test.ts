import { marshall } from '@aws-sdk/util-dynamodb'
import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../../errors/Result'
import { EventStoreEvent } from '../../../event-store/EventStoreEvent'
import { EventStoreEventBuilder, IncomingEventBridgeEvent } from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { WorkflowAgentsDeployedEvent } from '../../events/WorkflowAgentsDeployedEvent'
import { WorkflowStepProcessedEvent } from '../../events/WorkflowStepProcessedEvent'
import { IProcessWorkflowStepWorkerService } from '../ProcessWorkflowStepWorkerService/ProcessWorkflowStepWorkerService'
import { ProcessWorkflowStepWorkerController } from './ProcessWorkflowStepWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockWorkflowId = 'mockWorkflowId'

function buildMockWorkflowAgentsDeployedEvent(id: string): TypeUtilsMutable<EventStoreEvent> {
  const workflowAgentsDeployedEvent: WorkflowAgentsDeployedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED_EVENT,
    eventData: {
      workflowId: `${mockWorkflowId}-${id}`,
      objectKey: `mockObjectKey-${id}`,
    },
    createdAt: mockDate,
  }

  const workflowStepProcessedEvent: WorkflowStepProcessedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.WORKFLOW_STEP_PROCESSED_EVENT,
    eventData: {
      workflowId: `${mockWorkflowId}-${id}`,
      objectKey: `mockObjectKey-${id}`,
    },
    createdAt: mockDate,
  }

  // FIXME: This is a workaround to return either WorkflowAgentsDeployedEvent or WorkflowStepProcessedEvent
  // depending on the test case. Ideally, we should have a more structured way to handle this.
  return Math.random() > 0.5 ? workflowStepProcessedEvent : workflowAgentsDeployedEvent
}

function buildMockWorkflowAgentsDeployedEvents(ids: string[]): TypeUtilsMutable<EventStoreEvent>[] {
  return ids.map((id) => buildMockWorkflowAgentsDeployedEvent(id))
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
  incomingWorkflowAgentsDeployedEvents: EventStoreEvent[],
): IncomingEventBridgeEvent[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingWorkflowAgentsDeployedEvents[index]))
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
  mockWorkflowAgentsDeployedEvents: TypeUtilsMutable<EventStoreEvent>[]
  mockEventBridgeEvents: IncomingEventBridgeEvent[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockWorkflowAgentsDeployedEvents = buildMockWorkflowAgentsDeployedEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockWorkflowAgentsDeployedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockWorkflowAgentsDeployedEvents,
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
function buildMockProcessWorkflowStepWorkerService_succeeds(): IProcessWorkflowStepWorkerService {
  return { processWorkflowStep: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockProcessWorkflowStepWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IProcessWorkflowStepWorkerService {
  return {
    processWorkflowStep: jest
      .fn()
      .mockImplementation((incomingWorkflowAgentsDeployedEvent: WorkflowAgentsDeployedEvent) => {
        const shouldFail = Object.values(incomingWorkflowAgentsDeployedEvent.eventData).reduce(
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

describe(`Workflow Service ProcessWorkflowStepWorker ProcessWorkflowStepWorkerController
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      SQSEvent is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = undefined as never
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = undefined as never
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      SQSEvent is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = null as never
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = null as never
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      SQSEvent records are missing`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = {} as never
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are missing`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = {} as never
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined as never)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null as never)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      SQSRecord.body is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      SQSRecord.body is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      SQSRecord.body is not a valid JSON`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent is invalid`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = 'mockInvalidValue' as unknown as WorkflowAgentsDeployedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowAgentsDeployedEvent is
      invalid`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = 'mockInvalidValue' as unknown as WorkflowAgentsDeployedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent is not an instance of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input WorkflowAgentsDeployedEvent is not
      an instance of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent.eventName edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.eventName is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.eventName is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.eventName is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.eventName is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent.createdAt edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.createdAt is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.createdAt is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.createdAt is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.createdAt is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent.eventData edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.eventData is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.eventData is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.eventData is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.eventData is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test WorkflowAgentsDeployedEvent.eventData.workflowId edge cases
   ************************************************************/
  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.eventData.workflowId is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.eventData.workflowId is undefined`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData.workflowId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessWorkflowStepWorkerService.processWorkflowStep if the input
      WorkflowAgentsDeployedEvent.eventData.workflowId is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input
      WorkflowAgentsDeployedEvent.eventData.workflowId is null`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockId = 'AA'
    const mockWorkflowAgentsDeployedEvent = buildMockWorkflowAgentsDeployedEvent(mockId)
    mockWorkflowAgentsDeployedEvent.eventData.workflowId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockWorkflowAgentsDeployedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ProcessWorkflowStepWorkerService.processWorkflowStep a single time for an
      SQSEvent with a single record`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).toHaveBeenCalledTimes(1)
  })

  it(`calls ProcessWorkflowStepWorkerService.processWorkflowStep a multiple times for
      an SQSEvent with a multiple records`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls ProcessWorkflowStepWorkerService.processWorkflowStep with the expected
      input`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockWorkflowAgentsDeployedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).toHaveBeenNthCalledWith(
      1,
      mockWorkflowAgentsDeployedEvents[0],
    )
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).toHaveBeenNthCalledWith(
      2,
      mockWorkflowAgentsDeployedEvents[1],
    )
    expect(mockProcessWorkflowStepWorkerService.processWorkflowStep).toHaveBeenNthCalledWith(
      3,
      mockWorkflowAgentsDeployedEvents[2],
    )
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the ProcessWorkflowStepWorkerService returns
      no Failure`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_succeeds()
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessWorkflowStepWorkerService returns
      a non-transient Failure (test 1)`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: false,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessWorkflowStepWorkerService returns
      a non-transient Failure (test 2)`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: false,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessWorkflowStepWorkerService returns
      a non-transient Failure (test 3)`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: false,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessWorkflowStepWorkerService
      returns a transient Failure (test 1)`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: true,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessWorkflowStepWorkerService
      returns a transient Failure (test 2)`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: true,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessWorkflowStepWorkerService
      returns a transient Failure (test 3)`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: true,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
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

  it(`returns all SQSBatchItemFailures if the ProcessWorkflowStepWorkerService throws
      all and only transient Failure`, async () => {
    const mockProcessWorkflowStepWorkerService = buildMockProcessWorkflowStepWorkerService_failsOnData({
      transient: true,
    })
    const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(
      mockProcessWorkflowStepWorkerService,
    )
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processWorkflowStepWorkerController.processWorkflowStep(mockSqsEvent)
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
