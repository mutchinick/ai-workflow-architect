import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IncomingInvokeBedrockRequest } from '../IncomingInvokeBedrockRequest/IncomingInvokeBedrockRequest'
import {
  IInvokeBedrockApiService,
  InvokeBedrockApiServiceOutput,
} from '../InvokeBedrockApiService/InvokeBedrockApiService'
import { InvokeBedrockApiController } from './InvokeBedrockApiController'

const mockSystem = 'mockSystem'
const mockPrompt = 'mockPrompt'
const mockCompletion = 'mockCompletion'

function buildMockApiEventBody(): TypeUtilsMutable<IncomingInvokeBedrockRequest> {
  const mockValidRequest: IncomingInvokeBedrockRequest = {
    system: mockSystem,
    prompt: mockPrompt,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingInvokeBedrockRequest: IncomingInvokeBedrockRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingInvokeBedrockRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockInvokeBedrockApiService_succeeds(): IInvokeBedrockApiService {
  const mockServiceOutput: InvokeBedrockApiServiceOutput = {
    completion: mockCompletion,
  }
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { invokeBedrock: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockInvokeBedrockApiService_fails(failureKind: FailureKind): IInvokeBedrockApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { invokeBedrock: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Test Bedrock Service InvokeBedrockApi InvokeBedrockApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(invokeBedrockApiController.invokeBedrock(mockApiEvent)).resolves.not.toThrow()
  })

  it(`does not call InvokeBedrockApiService.invokeBedrock if the input APIGatewayProxyEventV2
      is undefined`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call InvokeBedrockApiService.invokeBedrock if the input APIGatewayProxyEventV2
      is invalid`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
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
  it(`does not call InvokeBedrockApiService.invokeBedrock if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call InvokeBedrockApiService.invokeBedrock if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call InvokeBedrockApiService.invokeBedrock if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.prompt edge cases
   ************************************************************/
  it(`does not call InvokeBedrockApiService.invokeBedrock if the input
      APIGatewayProxyEventV2.body.prompt is undefined`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.prompt = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.prompt is
      undefined`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.prompt = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call InvokeBedrockApiService.invokeBedrock if the input
      APIGatewayProxyEventV2.body.prompt is null`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.prompt = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.prompt is
      null`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.prompt = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls InvokeBedrockApiService.invokeBedrock with the expected input`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(mockInvokeBedrockApiService.invokeBedrock).toHaveBeenCalledWith(expectedServiceInput)
    expect(mockInvokeBedrockApiService.invokeBedrock).toHaveBeenCalledTimes(1)
  })

  it(`responds with 500 Internal Server Error if InvokeBedrockApiService.invokeBedrock returns
      a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_fails(mockFailureKind)
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if InvokeBedrockApiService.invokeBedrock returns
      a Failure of kind UnrecognizedError`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_fails('UnrecognizedError')
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if InvokeBedrockApiService.invokeBedrock returns a Failure
      of kind InvalidArgumentsError`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_fails('InvalidArgumentsError')
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
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
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockInvokeBedrockApiService = buildMockInvokeBedrockApiService_succeeds()
    const invokeBedrockApiController = new InvokeBedrockApiController(mockInvokeBedrockApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await invokeBedrockApiController.invokeBedrock(mockApiEvent)
    const expectedServiceOutput: InvokeBedrockApiServiceOutput = {
      completion: mockCompletion,
    }
    const expectedResponse = HttpResponse.Accepted(expectedServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
