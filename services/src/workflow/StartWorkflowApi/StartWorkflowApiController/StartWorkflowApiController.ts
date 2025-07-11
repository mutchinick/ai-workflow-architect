import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { IStartWorkflowApiService } from '../StartWorkflowApiService/StartWorkflowApiService'
import { IncomingStartWorkflowRequest, IncomingStartWorkflowRequestInput } from '../model/IncomingStartWorkflowRequest'

export interface IStartWorkflowApiController {
  startWorkflow: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class StartWorkflowApiController implements IStartWorkflowApiController {
  /**
   *
   */
  constructor(private readonly startWorkflowApiService: IStartWorkflowApiService) {}

  /**
   *
   */
  public async startWorkflow(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logCtx = 'StartWorkflowApiController.startWorkflow'
    console.info(`${logCtx} init:`, { apiEvent })

    const startWorkflowResult = await this.startWorkflowSafe(apiEvent)
    if (Result.isSuccess(startWorkflowResult)) {
      const startWorkflowOutput = startWorkflowResult.value
      const successResponse = HttpResponse.Accepted(startWorkflowOutput)
      console.info(`${logCtx} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(startWorkflowResult, 'InvalidArgumentsError')) {
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
  private async startWorkflowSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<IncomingStartWorkflowRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'StartWorkflowApiController.startWorkflowSafe'
    console.info(`${logCtx} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingStartWorkflowRequestInput
    const incomingStartWorkflowRequestResult = IncomingStartWorkflowRequest.fromInput(unverifiedRequest)
    if (Result.isFailure(incomingStartWorkflowRequestResult)) {
      console.error(`${logCtx} failure exit:`, { incomingStartWorkflowRequestResult, unverifiedRequest })
      return incomingStartWorkflowRequestResult
    }

    const incomingStartWorkflowRequest = incomingStartWorkflowRequestResult.value
    const startWorkflowResult = await this.startWorkflowApiService.startWorkflow(incomingStartWorkflowRequest)
    Result.isFailure(startWorkflowResult)
      ? console.error(`${logCtx} exit failure:`, { startWorkflowResult, incomingStartWorkflowRequest })
      : console.info(`${logCtx} exit success:`, { startWorkflowResult, incomingStartWorkflowRequest })

    return startWorkflowResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'StartWorkflowApiController.parseInputRequest'

    try {
      const unverifiedRequest = JSON.parse(apiEvent.body!)
      return Result.makeSuccess<unknown>(unverifiedRequest)
    } catch (error) {
      console.error(`${logCtx} error caught:`, { error, apiEvent })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { invalidArgsFailure, apiEvent })
      return invalidArgsFailure
    }
  }
}
