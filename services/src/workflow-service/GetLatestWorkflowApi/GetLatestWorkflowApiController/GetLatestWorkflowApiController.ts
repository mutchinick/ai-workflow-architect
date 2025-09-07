import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import {
  GetLatestWorkflowApiServiceOutput,
  IGetLatestWorkflowApiService,
} from '../GetLatestWorkflowApiService/GetLatestWorkflowApiService'
import {
  IncomingGetLatestWorkflowRequest,
  IncomingGetLatestWorkflowRequestProps,
} from '../IncomingGetLatestWorkflowRequest/IncomingGetLatestWorkflowRequest'

export interface IGetLatestWorkflowApiController {
  getLatestWorkflow: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class GetLatestWorkflowApiController implements IGetLatestWorkflowApiController {
  /**
   *
   */
  constructor(private readonly getLatestWorkflowApiService: IGetLatestWorkflowApiService) {}

  /**
   *
   */
  public async getLatestWorkflow(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logCtx = 'GetLatestWorkflowApiController.getLatestWorkflow'
    console.info(`${logCtx} init:`, { apiEvent })

    const getLatestWorkflowResult = await this.getLatestWorkflowSafe(apiEvent)
    if (Result.isSuccess(getLatestWorkflowResult)) {
      const getLatestWorkflowOutput = getLatestWorkflowResult.value
      const successResponse = HttpResponse.OK(getLatestWorkflowOutput)
      console.info(`${logCtx} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(getLatestWorkflowResult, 'InvalidArgumentsError')) {
      const badRequestError = HttpResponse.BadRequestError()
      console.error(`${logCtx} failure exit:`, { badRequestError, apiEvent })
      return badRequestError
    }

    const internalServerError = HttpResponse.InternalServerError()
    console.error(`${logCtx} failure exit:`, { internalServerError, apiEvent })
    return internalServerError
  }

  /**
   *
   */
  private async getLatestWorkflowSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<
    | Success<GetLatestWorkflowApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'GetLatestWorkflowApiController.getLatestWorkflowSafe'
    console.info(`${logCtx} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingGetLatestWorkflowRequestProps
    const incomingGetLatestWorkflowRequestResult = IncomingGetLatestWorkflowRequest.fromProps(unverifiedRequest)
    if (Result.isFailure(incomingGetLatestWorkflowRequestResult)) {
      console.error(`${logCtx} failure exit:`, { incomingGetLatestWorkflowRequestResult, unverifiedRequest })
      return incomingGetLatestWorkflowRequestResult
    }

    const incomingGetLatestWorkflowRequest = incomingGetLatestWorkflowRequestResult.value
    const getLatestWorkflowResult = await this.getLatestWorkflowApiService.getLatestWorkflow(
      incomingGetLatestWorkflowRequest,
    )
    Result.isFailure(getLatestWorkflowResult)
      ? console.error(`${logCtx} exit failure:`, { getLatestWorkflowResult, incomingGetLatestWorkflowRequest })
      : console.info(`${logCtx} exit success:`, { getLatestWorkflowResult, incomingGetLatestWorkflowRequest })

    return getLatestWorkflowResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'GetLatestWorkflowApiController.parseInputRequest'

    try {
      const unverifiedRequest = JSON.parse(apiEvent.body!)
      return Result.makeSuccess<unknown>(unverifiedRequest)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, apiEvent })
      return failure
    }
  }
}
