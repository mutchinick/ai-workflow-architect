import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import {
  IncomingInvokeBedrockRequest,
  IncomingInvokeBedrockRequestProps,
} from '../IncomingInvokeBedrockRequest/IncomingInvokeBedrockRequest'
import {
  IInvokeBedrockApiService,
  InvokeBedrockApiServiceOutput,
} from '../InvokeBedrockApiService/InvokeBedrockApiService'

export interface IInvokeBedrockApiController {
  invokeBedrock: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class InvokeBedrockApiController implements IInvokeBedrockApiController {
  /**
   *
   */
  constructor(private readonly invokeBedrockApiService: IInvokeBedrockApiService) {}

  /**
   *
   */
  public async invokeBedrock(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logCtx = 'InvokeBedrockApiController.invokeBedrock'
    console.info(`${logCtx} init:`, { apiEvent })

    const invokeBedrockResult = await this.invokeBedrockSafe(apiEvent)
    if (Result.isSuccess(invokeBedrockResult)) {
      const invokeBedrockOutput = invokeBedrockResult.value
      const successResponse = HttpResponse.Accepted(invokeBedrockOutput)
      console.info(`${logCtx} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(invokeBedrockResult, 'InvalidArgumentsError')) {
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
  private async invokeBedrockSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<
    | Success<InvokeBedrockApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'TestBedrockTransientError'>
    | Failure<'TestBedrockPermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockApiController.invokeBedrockSafe'
    console.info(`${logCtx} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingInvokeBedrockRequestProps
    const incomingInvokeBedrockRequestResult = IncomingInvokeBedrockRequest.fromProps(unverifiedRequest)
    if (Result.isFailure(incomingInvokeBedrockRequestResult)) {
      console.error(`${logCtx} failure exit:`, { incomingInvokeBedrockRequestResult, unverifiedRequest })
      return incomingInvokeBedrockRequestResult
    }

    const incomingInvokeBedrockRequest = incomingInvokeBedrockRequestResult.value
    const invokeBedrockResult = await this.invokeBedrockApiService.invokeBedrock(incomingInvokeBedrockRequest)
    Result.isFailure(invokeBedrockResult)
      ? console.error(`${logCtx} exit failure:`, { invokeBedrockResult, incomingInvokeBedrockRequest })
      : console.info(`${logCtx} exit success:`, { invokeBedrockResult, incomingInvokeBedrockRequest })

    return invokeBedrockResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'InvokeBedrockApiController.parseInputRequest'

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
