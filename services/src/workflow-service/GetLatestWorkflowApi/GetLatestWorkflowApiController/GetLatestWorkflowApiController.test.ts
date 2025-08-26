import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { WorkflowProps } from '../../models/Workflow'
import { IGetLatestWorkflowApiService } from '../GetLatestWorkflowApiService/GetLatestWorkflowApiService'
import { IncomingGetLatestWorkflowRequest } from '../IncomingGetLatestWorkflowRequest/IncomingGetLatestWorkflowRequest'
import { GetLatestWorkflowApiController } from './GetLatestWorkflowApiController'

const mockQuery = 'mockQuery'
const mockWorkflowId = 'mockWorkflowId'

function buildMockApiEventBody(): TypeUtilsMutable<IncomingGetLatestWorkflowRequest> {
  const mockValidRequest: IncomingGetLatestWorkflowRequest = {
    workflowId: mockWorkflowId,
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingGetLatestWorkflowRequest: IncomingGetLatestWorkflowRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingGetLatestWorkflowRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

function buildMockWorkflowProps(): WorkflowProps {
  return {
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
    },
    steps: [
      {
        stepId: 'mockStepId-1',
        stepStatus: 'completed',
        executionOrder: 1,
        assistant: {
          name: 'mockAssistantName-1',
          role: 'mockAssistantRole-1',
          system: 'mockAssistantSystem-1',
          prompt: 'mockAssistantPrompt-1',
          phaseName: 'mockPhaseName-1',
        },
        llmSystem: 'mockLlmSystem-1',
        llmPrompt: 'mockLlmPrompt-1',
        llmResult: 'mockLlmResult-1',
      },
      {
        stepId: 'mockStepId-2',
        stepStatus: 'completed',
        executionOrder: 2,
        assistant: {
          name: 'mockAssistantName-2',
          role: 'mockAssistantRole-2',
          system: 'mockAssistantSystem-2',
          prompt: 'mockAssistantPrompt-2',
          phaseName: 'mockPhaseName-2',
        },
        llmSystem: 'mockLlmSystem-2',
        llmPrompt: 'mockLlmPrompt-2',
        llmResult: 'mockLlmResult-2',
      },
      {
        stepId: 'mockStepId-3',
        stepStatus: 'pending',
        executionOrder: 3,
        assistant: {
          name: 'mockAssistantName-3',
          role: 'mockAssistantRole-3',
          system: 'mockAssistantSystem-3',
          prompt: 'mockAssistantPrompt-3',
          phaseName: 'mockPhaseName-3',
        },
        llmSystem: 'mockLlmSystem-3',
        llmPrompt: '<PREVIOUS_RESULT>',
        llmResult: '',
      },
    ],
  }
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockGetLatestWorkflowApiService_succeeds(): IGetLatestWorkflowApiService {
  const mockServiceOutput = buildMockWorkflowProps()
  const mockServiceOutputResult = Result.makeSuccess(mockServiceOutput)
  return { getLatestWorkflow: jest.fn().mockResolvedValue(mockServiceOutputResult) }
}

function buildMockGetLatestWorkflowApiService_fails(failureKind: FailureKind): IGetLatestWorkflowApiService {
  const mockFailure = Result.makeFailure(failureKind, failureKind, false)
  return { getLatestWorkflow: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Workflow Service GetLatestWorkflowApi GetLatestWorkflowApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)).resolves.not.toThrow()
  })

  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input APIGatewayProxyEventV2
      is undefined`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input APIGatewayProxyEventV2
      is invalid`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
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
  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.workflowId edge cases
   ************************************************************/
  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input
      APIGatewayProxyEventV2.body.workflowId is undefined`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.workflowId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.workflowId is
      undefined`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.workflowId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  //
  it(`does not call GetLatestWorkflowApiService.getLatestWorkflow if the input
      APIGatewayProxyEventV2.body.workflowId is null`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.workflowId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.workflowId is
      null`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.workflowId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls GetLatestWorkflowApiService.getLatestWorkflow with the expected input`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).toHaveBeenCalledWith(expectedServiceInput)
    expect(mockGetLatestWorkflowApiService.getLatestWorkflow).toHaveBeenCalledTimes(1)
  })

  it(`responds with 500 Internal Server Error if GetLatestWorkflowApiService.getLatestWorkflow returns
      a Failure of kind not accounted for`, async () => {
    const mockFailureKind = 'mockFailureKind' as FailureKind
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_fails(mockFailureKind)
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if GetLatestWorkflowApiService.getLatestWorkflow returns
      a Failure of kind UnrecognizedError`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_fails('UnrecognizedError')
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if GetLatestWorkflowApiService.getLatestWorkflow returns a Failure
      of kind InvalidArgumentsError`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_fails('InvalidArgumentsError')
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
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
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockGetLatestWorkflowApiService = buildMockGetLatestWorkflowApiService_succeeds()
    const getLatestWorkflowApiController = new GetLatestWorkflowApiController(mockGetLatestWorkflowApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await getLatestWorkflowApiController.getLatestWorkflow(mockApiEvent)
    const expectedServiceOutput = buildMockWorkflowProps()
    const expectedResponse = HttpResponse.Accepted(expectedServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
