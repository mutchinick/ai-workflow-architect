import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { CreateJobApiServiceOutput, ICreateJobApiService } from '../CreateJobApiService/CreateJobApiService'
import { IncomingCreateJobRequest } from '../model/IncomingCreateJobRequest'
import { CreateJobApiController } from './CreateJobApiController'

const mockJobId = 'mockJobId'

function buildMockApiEventBody(): TypeUtilsMutable<IncomingCreateJobRequest> {
  const mockValidRequest: IncomingCreateJobRequest = {
    jobId: mockJobId,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingCreateJobRequest: IncomingCreateJobRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingCreateJobRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockCreateJobApiService_succeeds(): ICreateJobApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: CreateJobApiServiceOutput = mockApiEventBody
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { createJob: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockCreateJobApiService_fails(failureKind: FailureKind): ICreateJobApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { createJob: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Test Template Service CreateJobApi CreateJobApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(createJobApiController.createJob(mockApiEvent)).resolves.not.toThrow()
  })

  it(`does not call CreateJobApiService.createJob if the input APIGatewayProxyEventV2
      is undefined`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call CreateJobApiService.createJob if the input APIGatewayProxyEventV2
      is invalid`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  //
  it(`does not call CreateJobApiService.createJob if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call CreateJobApiService.createJob if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call CreateJobApiService.createJob if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.jobId edge cases
   ************************************************************/
  it(`does not call CreateJobApiService.createJob if the input
      APIGatewayProxyEventV2.body.jobId is undefined`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.jobId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.jobId is
      undefined`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.jobId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call CreateJobApiService.createJob if the input
      APIGatewayProxyEventV2.body.jobId is null`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.jobId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.jobId is
      null`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.jobId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls CreateJobApiService.createJob with the expected input`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await createJobApiController.createJob(mockApiEvent)
    expect(mockCreateJobApiService.createJob).toHaveBeenCalledWith(expectedServiceInput)
    expect(mockCreateJobApiService.createJob).toHaveBeenCalledTimes(1)
  })

  it(`responds with 500 Internal Server Error if CreateJobApiService.createJob returns
      a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockCreateJobApiService = buildMockCreateJobApiService_fails(mockFailureKind)
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if CreateJobApiService.createJob returns
      a Failure of kind UnrecognizedError`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_fails('UnrecognizedError')
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if CreateJobApiService.createJob returns a Failure
      of kind InvalidArgumentsError`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_fails('InvalidArgumentsError')
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`responds with status code 202 Accepted`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockCreateJobApiService = buildMockCreateJobApiService_succeeds()
    const createJobApiController = new CreateJobApiController(mockCreateJobApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await createJobApiController.createJob(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
