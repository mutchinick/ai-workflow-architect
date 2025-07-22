import { marshall } from '@aws-sdk/util-dynamodb'
import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Result } from '../../../errors/Result'
import { EventStoreEvent } from '../../../event-store/EventStoreEvent'
import { EventStoreEventBuilder, IncomingEventBridgeEvent } from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { JobCreatedEvent } from '../../events/JobCreatedEvent'
import { IProcessStepWorkerService } from '../ProcessStepWorkerService/ProcessStepWorkerService'
import { ProcessStepWorkerController } from './ProcessStepWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockJobId = 'mockJobId'
const mockCreated = true

function buildMockJobCreatedEvent(id: string): TypeUtilsMutable<JobCreatedEvent> {
  const incomingEvent: JobCreatedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.JOB_CREATED_EVENT,
    eventData: {
      jobId: `${mockJobId}-${id}`,
      created: mockCreated,
    },
    createdAt: mockDate,
  }
  return incomingEvent
}

function buildMockJobCreatedEvents(ids: string[]): TypeUtilsMutable<JobCreatedEvent>[] {
  return ids.map((id) => buildMockJobCreatedEvent(id))
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockEventBridgeEvent(id: string, incomingEvent: JobCreatedEvent): IncomingEventBridgeEvent {
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
  incomingJobCreatedEvents: JobCreatedEvent[],
): IncomingEventBridgeEvent[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingJobCreatedEvents[index]))
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
  mockJobCreatedEvents: TypeUtilsMutable<JobCreatedEvent>[]
  mockEventBridgeEvents: IncomingEventBridgeEvent[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockJobCreatedEvents = buildMockJobCreatedEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockJobCreatedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockJobCreatedEvents,
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
function buildMockProcessStepWorkerService_succeeds(): IProcessStepWorkerService {
  return { processStep: jest.fn().mockResolvedValue(Result.makeSuccess()) }
}

function buildMockProcessStepWorkerService_failsOnData({
  transient,
}: {
  transient: boolean
}): IProcessStepWorkerService {
  return {
    processStep: jest.fn().mockImplementation((incomingJobCreatedEvent: JobCreatedEvent) => {
      const shouldFail = Object.values(incomingJobCreatedEvent.eventData).reduce(
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

describe(`Test Template Service ProcessStepWorker ProcessStepWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(processStepWorkerController.processSteps(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`does not call ProcessStepWorkerService.processStep if the input SQSEvent is
      undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = undefined as never
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = undefined as never
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input SQSEvent is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = null as never
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = null as never
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input SQSEvent records
      are missing`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = {} as never
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are missing`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = {} as never
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined as never)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null as never)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures and does not call the
      service if the input SQSEvent records are empty`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input SQSRecord.body
      is undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input SQSRecord.body
      is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input JobCreatedEvent
      is invalid`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = 'mockInvalidValue' as unknown as JobCreatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent is invalid`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = 'mockInvalidValue' as unknown as JobCreatedEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input JobCreatedEvent
      is not an instance of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent is not an instance
      of the class`, async () => {
    // Mocking the fromEventBridge method to return an unknown event
    jest.spyOn(EventStoreEventBuilder, 'fromEventBridge').mockImplementationOnce(() => {
      class UnknownEvent extends EventStoreEvent {
        static create(): EventStoreEvent {
          return new UnknownEvent('UNKNOWN_EVENT', {}, mockIdempotencyKey, mockDate)
        }
      }
      return Result.makeSuccess(UnknownEvent.create())
    })

    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent.eventName edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.eventName is undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.eventName is
      undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventName = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.eventName is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.eventName is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventName = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent.createdAt edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.createdAt is undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.createdAt is
      undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.createdAt is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.createdAt is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent.eventData edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.eventData is undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.eventData is
      undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.eventData is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.eventData is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent.eventData.jobId edge cases
   ************************************************************/
  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.eventData.jobId is undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData.jobId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.eventData.jobId is
      undefined`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData.jobId = undefined as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call ProcessStepWorkerService.processStep if the input
      JobCreatedEvent.eventData.jobId is null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData.jobId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchItemFailures if the input JobCreatedEvent.eventData.jobId is
      null`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockId = 'AA'
    const mockJobCreatedEvent = buildMockJobCreatedEvent(mockId)
    mockJobCreatedEvent.eventData.jobId = null as never
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockJobCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ProcessStepWorkerService.processStep a single time for an SQSEvent with a
      single record`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).toHaveBeenCalledTimes(1)
  })

  it(`calls ProcessStepWorkerService.processStep a multiple times for an SQSEvent with
      a multiple records`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls ProcessStepWorkerService.processStep with the expected input`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockJobCreatedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await processStepWorkerController.processSteps(mockSqsEvent)
    expect(mockProcessStepWorkerService.processStep).toHaveBeenNthCalledWith(1, mockJobCreatedEvents[0])
    expect(mockProcessStepWorkerService.processStep).toHaveBeenNthCalledWith(2, mockJobCreatedEvents[1])
    expect(mockProcessStepWorkerService.processStep).toHaveBeenNthCalledWith(3, mockJobCreatedEvents[2])
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns no SQSBatchItemFailures if the ProcessStepWorkerService returns no
      Failure`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_succeeds()
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessStepWorkerService returns a
      non-transient Failure (test 1)`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: false })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessStepWorkerService returns a
      non-transient Failure (test 2)`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: false })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns no SQSBatchItemFailures if the ProcessStepWorkerService returns a
      non-transient Failure (test 3)`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: false })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessStepWorkerService returns a
      transient Failure (test 1)`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: true })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessStepWorkerService returns a
      transient Failure (test 2)`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: true })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC', 'DD', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns expected SQSBatchItemFailures if the ProcessStepWorkerService returns a
      transient Failure (test 3)`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: true })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA', 'BB-FAILURE', 'CC-FAILURE', 'DD-FAILURE', 'EE-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
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

  it(`returns all SQSBatchItemFailures if the ProcessStepWorkerService throws all and
      only transient Failure`, async () => {
    const mockProcessStepWorkerService = buildMockProcessStepWorkerService_failsOnData({ transient: true })
    const processStepWorkerController = new ProcessStepWorkerController(mockProcessStepWorkerService)
    const mockIds = ['AA-FAILURE', 'BB-FAILURE', 'CC-FAILURE']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await processStepWorkerController.processSteps(mockSqsEvent)
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
