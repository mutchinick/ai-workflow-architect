import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { JobCreatedEvent, JobCreatedEventData } from '../../events/JobCreatedEvent'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IncomingCreateJobRequest } from '../model/IncomingCreateJobRequest'
import { CreateJobApiService, CreateJobApiServiceOutput } from './CreateJobApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

function buildMockIncomingRequest(): TypeUtilsMutable<IncomingCreateJobRequest> {
  const mockClass = IncomingCreateJobRequest.fromInput({
    jobId: 'mockJobId',
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingRequest = buildMockIncomingRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockEventStoreClient_succeeds(value?: unknown): IEventStoreClient {
  const mockResult = Result.makeSuccess(value)
  return { publish: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockEventStoreClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IEventStoreClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { publish: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Test Template Service CreateJobApi CreateJobApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingCreateJobRequest edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingCreateJobRequest is valid`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const result = await createJobApiService.createJob(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequest is undefined`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const mockTestRequest = undefined as never
    const result = await createJobApiService.createJob(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequest is null`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const mockTestRequest = null as never
    const result = await createJobApiService.createJob(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequest is not an instance of the class`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const mockTestRequest = { ...mockIncomingRequest }
    const result = await createJobApiService.createJob(mockTestRequest)
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
  it(`propagates the Failure if JobCreatedEvent.fromData returns a Failure`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    jest.spyOn(JobCreatedEvent, 'fromData').mockReturnValueOnce(expectedResult)
    const result = await createJobApiService.createJob(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`calls EventStoreClient.publish a single time`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    await createJobApiService.createJob(mockIncomingRequest)
    expect(mockEventStoreClient.publish).toHaveBeenCalledTimes(1)
  })

  it(`calls EventStoreClient.publish with the expected input`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    await createJobApiService.createJob(mockIncomingRequest)
    const mockJobCreatedEventInput: JobCreatedEventData = {
      jobId: mockIncomingRequest.jobId,
      created: true,
    }
    const expectedJobCreatedEventResult = JobCreatedEvent.fromData(mockJobCreatedEventInput)
    const expectedJobCreatedEvent = Result.getSuccessValueOrThrow(expectedJobCreatedEventResult)
    expect(mockEventStoreClient.publish).toHaveBeenCalledWith(expectedJobCreatedEvent)
  })

  it(`propagates the Failure if EventStoreClient.publish returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockEventStoreClient = buildMockEventStoreClient_fails(mockFailureKind, mockError, mockTransient)
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const result = await createJobApiService.createJob(mockIncomingRequest)
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
  it(`returns the expected Success<CreateJobApiServiceOutput> if
      EventStoreClient.publish returns a Failure of kind DuplicateEventError`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_fails('DuplicateEventError')
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const result = await createJobApiService.createJob(mockIncomingRequest)
    const expectedOutput: CreateJobApiServiceOutput = {
      jobId: mockIncomingRequest.jobId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected Success<CreateJobApiServiceOutput> if the execution path is
      successful`, async () => {
    const mockEventStoreClient = buildMockEventStoreClient_succeeds()
    const createJobApiService = new CreateJobApiService(mockEventStoreClient)
    const result = await createJobApiService.createJob(mockIncomingRequest)
    const expectedOutput: CreateJobApiServiceOutput = {
      jobId: mockIncomingRequest.jobId,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
