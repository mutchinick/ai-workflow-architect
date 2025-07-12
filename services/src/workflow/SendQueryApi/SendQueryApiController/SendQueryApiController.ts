import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { ISendQueryApiService } from '../SendQueryApiService/SendQueryApiService'
import {
  IncomingSendQueryRequest,
  IncomingSendQueryRequestProps,
} from '../IncomingSendQueryRequest/IncomingSendQueryRequest'

export interface ISendQueryApiController {
  sendQuery: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class SendQueryApiController implements ISendQueryApiController {
  /**
   *
   */
  constructor(private readonly sendQueryApiService: ISendQueryApiService) {}

  /**
   *
   */
  public async sendQuery(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logCtx = 'SendQueryApiController.sendQuery'
    console.info(`${logCtx} init:`, { apiEvent })

    const sendQueryResult = await this.sendQuerySafe(apiEvent)
    if (Result.isSuccess(sendQueryResult)) {
      const sendQueryOutput = sendQueryResult.value
      const successResponse = HttpResponse.Accepted(sendQueryOutput)
      console.info(`${logCtx} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(sendQueryResult, 'InvalidArgumentsError')) {
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
  private async sendQuerySafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<IncomingSendQueryRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'SendQueryApiController.sendQuerySafe'
    console.info(`${logCtx} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingSendQueryRequestProps
    const incomingSendQueryRequestResult = IncomingSendQueryRequest.fromProps(unverifiedRequest)
    if (Result.isFailure(incomingSendQueryRequestResult)) {
      console.error(`${logCtx} failure exit:`, { incomingSendQueryRequestResult, unverifiedRequest })
      return incomingSendQueryRequestResult
    }

    const incomingSendQueryRequest = incomingSendQueryRequestResult.value
    const sendQueryResult = await this.sendQueryApiService.sendQuery(incomingSendQueryRequest)
    Result.isFailure(sendQueryResult)
      ? console.error(`${logCtx} exit failure:`, { sendQueryResult, incomingSendQueryRequest })
      : console.info(`${logCtx} exit success:`, { sendQueryResult, incomingSendQueryRequest })

    return sendQueryResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'SendQueryApiController.parseInputRequest'

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
