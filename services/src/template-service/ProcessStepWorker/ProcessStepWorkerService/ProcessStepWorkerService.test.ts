import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { JobCreatedEvent } from '../../events/JobCreatedEvent'
import { StepProcessedEvent } from '../../events/StepProcessedEvent'
import { ProcessStepWorkerService } from './ProcessStepWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockIdempotencyKey = 'mockIdempotencyKey'
const mockJobId = 'mockJobId'
const mockCreated = true

function buildMockIncomingJobCreatedEvent(): TypeUtilsMutable<JobCreatedEvent> {
  const mockClass: JobCreatedEvent = {
    idempotencyKey: mockIdempotencyKey,
    eventName: EventStoreEventName.JOB_CREATED_EVENT,
    eventData: {
      jobId: mockJobId,
      created: mockCreated,
    },
    createdAt: mockDate,
  }
  Object.setPrototypeOf(mockClass, JobCreatedEvent.prototype)
  return mockClass
}

const mockIncomingJobCreatedEvent = buildMockIncomingJobCreatedEvent()

function buildExpectedStepProcessedEvent(): TypeUtilsMutable<StepProcessedEvent> {
  const mockClass = StepProcessedEvent.fromData({
    jobId: mockJobId,
    processed: true,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const expectedStepProcessedEvent = buildExpectedStepProcessedEvent()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
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

describe(`Template Service ProcessStepWorker ProcessStepWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test JobCreatedEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input JobCreatedEvent is valid`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const result = await processStepWorkerService.processStep(mockIncomingJobCreatedEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      JobCreatedEvent is undefined`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const mockTestEvent = undefined as never
    const result = await processStepWorkerService.processStep(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      JobCreatedEvent is null`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const mockTestEvent = null as never
    const result = await processStepWorkerService.processStep(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      JobCreatedEvent is not an instance of the class`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const mockTestEvent = { ...mockIncomingJobCreatedEvent }
    const result = await processStepWorkerService.processStep(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`propagates the Failure if StepProcessedEvent.fromData returns a Failure`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(StepProcessedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await processStepWorkerService.processStep(mockIncomingJobCreatedEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    await processStepWorkerService.processStep(mockIncomingJobCreatedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected StepProcessedEvent`, async () => {
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    await processStepWorkerService.processStep(mockIncomingJobCreatedEvent)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedStepProcessedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError' as never
    const mockTransient = 'mockTransient' as never
    const mockEventStoreClient = buildEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const result = await processStepWorkerService.processStep(mockIncomingJobCreatedEvent)
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
    const mockEventStoreClient = buildEventStoreClient_succeeds()
    const processStepWorkerService = new ProcessStepWorkerService(mockEventStoreClient)
    const result = await processStepWorkerService.processStep(mockIncomingJobCreatedEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
