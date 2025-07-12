import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IncomingSendQueryRequest } from '../IncomingSendQueryRequest/IncomingSendQueryRequest'
import { ISendQueryApiService, SendQueryApiServiceOutput } from '../SendQueryApiService/SendQueryApiService'
import { SendQueryApiController } from './SendQueryApiController'

const mockQuery = 'mockQuery'
const mockPromptEnhanceRounds = 3
const mockResponseEnhanceRounds = 2

function buildMockApiEventBody(): TypeUtilsMutable<IncomingSendQueryRequest> {
  const mockValidRequest: IncomingSendQueryRequest = {
    query: mockQuery,
    promptEnhanceRounds: mockPromptEnhanceRounds,
    responseEnhanceRounds: mockResponseEnhanceRounds,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingSendQueryRequest: IncomingSendQueryRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingSendQueryRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockSendQueryApiService_succeeds(): ISendQueryApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: SendQueryApiServiceOutput = {
    query: mockApiEventBody.query,
    promptEnhanceRounds: mockApiEventBody.promptEnhanceRounds,
    responseEnhanceRounds: mockApiEventBody.responseEnhanceRounds,
    workflowId: 'mockWorkflowId',
    objectKey: 'mockObjectKey',
  }
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { sendQuery: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockSendQueryApiService_fails(failureKind: FailureKind): ISendQueryApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { sendQuery: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Template Service SendQueryApi SendQueryApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(sendQueryApiController.sendQuery(mockApiEvent)).resolves.not.toThrow()
  })

  it(`does not call SendQueryApiService.sendQuery if the input APIGatewayProxyEventV2
      is undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call SendQueryApiService.sendQuery if the input APIGatewayProxyEventV2
      is invalid`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
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
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.query edge cases
   ************************************************************/
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body.query is undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.query = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.query is
      undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.query = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body.query is null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.query = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.query is
      null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.query = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.promptEnhanceRounds edge cases
   ************************************************************/
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body.promptEnhanceRounds is undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.promptEnhanceRounds = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.promptEnhanceRounds is
      undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.promptEnhanceRounds = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body.promptEnhanceRounds is null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.promptEnhanceRounds = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.promptEnhanceRounds is
      null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.promptEnhanceRounds = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.responseEnhanceRounds edge cases
   ************************************************************/
  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body.responseEnhanceRounds is undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.responseEnhanceRounds = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.responseEnhanceRounds is
      undefined`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.responseEnhanceRounds = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call SendQueryApiService.sendQuery if the input
      APIGatewayProxyEventV2.body.responseEnhanceRounds is null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.responseEnhanceRounds = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.responseEnhanceRounds is
      null`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.responseEnhanceRounds = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls SendQueryApiService.sendQuery with the expected input`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await sendQueryApiController.sendQuery(mockApiEvent)
    expect(mockSendQueryApiService.sendQuery).toHaveBeenCalledWith(expectedServiceInput)
    expect(mockSendQueryApiService.sendQuery).toHaveBeenCalledTimes(1)
  })

  it(`responds with 500 Internal Server Error if SendQueryApiService.sendQuery returns
      a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockSendQueryApiService = buildMockSendQueryApiService_fails(mockFailureKind)
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if SendQueryApiService.sendQuery returns
      a Failure of kind UnrecognizedError`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_fails('UnrecognizedError')
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if SendQueryApiService.sendQuery returns a Failure
      of kind InvalidArgumentsError`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_fails('InvalidArgumentsError')
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
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
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockSendQueryApiService = buildMockSendQueryApiService_succeeds()
    const sendQueryApiController = new SendQueryApiController(mockSendQueryApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await sendQueryApiController.sendQuery(mockApiEvent)
    const expectedServiceOutput: SendQueryApiServiceOutput = {
      query: mockApiEventBody.query,
      promptEnhanceRounds: mockApiEventBody.promptEnhanceRounds,
      responseEnhanceRounds: mockApiEventBody.responseEnhanceRounds,
      workflowId: 'mockWorkflowId',
      objectKey: 'mockObjectKey',
    }
    const expectedResponse = HttpResponse.Accepted(expectedServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
