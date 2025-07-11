import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IncomingStartWorkflowRequest } from '../model/IncomingStartWorkflowRequest'
import {
  IStartWorkflowApiService,
  StartWorkflowApiServiceOutput,
} from '../StartWorkflowApiService/StartWorkflowApiService'
import { StartWorkflowApiController } from './StartWorkflowApiController'

const mockWorkflowId = 'mockWorkflowId'

function buildMockApiEventBody(): TypeUtilsMutable<IncomingStartWorkflowRequest> {
  const mockValidRequest: IncomingStartWorkflowRequest = {
    workflowId: mockWorkflowId,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingStartWorkflowRequest: IncomingStartWorkflowRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingStartWorkflowRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockStartWorkflowApiService_succeeds(): IStartWorkflowApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: StartWorkflowApiServiceOutput = mockApiEventBody
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { startWorkflow: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockStartWorkflowApiService_fails(failureKind: FailureKind): IStartWorkflowApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { startWorkflow: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Workflow Service StartWorkflowApi StartWorkflowApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(startWorkflowApiController.startWorkflow(mockApiEvent)).resolves.not.toThrow()
  })

  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2 is undefined`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2 is invalid`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.workflowId edge cases
   ************************************************************/
  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2.body.workflowId is undefined`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.workflowId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request and does not call the service if the input
      APIGatewayProxyEventV2.body.workflowId is null`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.workflowId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
    expect(mockStartWorkflowApiService.startWorkflow).not.toHaveBeenCalled()
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls StartWorkflowApiService.startWorkflow with the expected input`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await startWorkflowApiController.startWorkflow(mockApiEvent)
    expect(mockStartWorkflowApiService.startWorkflow).toHaveBeenCalledWith(expectedServiceInput)
    expect(mockStartWorkflowApiService.startWorkflow).toHaveBeenCalledTimes(1)
  })

  it(`responds with 500 Internal Server Error if StartWorkflowApiService.startWorkflow
      returns a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_fails(mockFailureKind)
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if StartWorkflowApiService.startWorkflow
      returns a Failure of kind UnrecognizedError`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_fails('UnrecognizedError')
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request and does not call the service if
      StartWorkflowApiService.startWorkflow returns a Failure of kind
      InvalidArgumentsError`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_fails('InvalidArgumentsError')
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await startWorkflowApiController.startWorkflow(mockApiEvent)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
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
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockStartWorkflowApiService = buildMockStartWorkflowApiService_succeeds()
    const startWorkflowApiController = new StartWorkflowApiController(mockStartWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await startWorkflowApiController.startWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
