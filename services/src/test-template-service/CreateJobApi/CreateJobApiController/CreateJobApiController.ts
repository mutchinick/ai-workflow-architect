import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import { HttpResponse } from '../../../shared/HttpResponse'
import { ICreateJobApiService } from '../CreateJobApiService/CreateJobApiService'
import { IncomingCreateJobRequest, IncomingCreateJobRequestInput } from '../model/IncomingCreateJobRequest'

export interface ICreateJobApiController {
  createJob: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class CreateJobApiController implements ICreateJobApiController {
  /**
   *
   */
  constructor(private readonly createJobApiService: ICreateJobApiService) {}

  /**
   *
   */
  public async createJob(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logCtx = 'CreateJobApiController.createJob'
    console.info(`${logCtx} init:`, { apiEvent })

    const createJobResult = await this.createJobSafe(apiEvent)
    if (Result.isSuccess(createJobResult)) {
      const createJobOutput = createJobResult.value
      const successResponse = HttpResponse.Accepted(createJobOutput)
      console.info(`${logCtx} exit success:`, { successResponse, apiEvent })
      return successResponse
    }

    if (Result.isFailureOfKind(createJobResult, 'InvalidArgumentsError')) {
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
  private async createJobSafe(
    apiEvent: APIGatewayProxyEventV2,
  ): Promise<Success<IncomingCreateJobRequest> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'CreateJobApiController.createJobSafe'
    console.info(`${logCtx} init:`, { apiEvent })

    const parseInputRequestResult = this.parseInputRequest(apiEvent)
    if (Result.isFailure(parseInputRequestResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputRequestResult, apiEvent })
      return parseInputRequestResult
    }

    const unverifiedRequest = parseInputRequestResult.value as IncomingCreateJobRequestInput
    const incomingCreateJobRequestResult = IncomingCreateJobRequest.fromInput(unverifiedRequest)
    if (Result.isFailure(incomingCreateJobRequestResult)) {
      console.error(`${logCtx} failure exit:`, { incomingCreateJobRequestResult, unverifiedRequest })
      return incomingCreateJobRequestResult
    }

    const incomingCreateJobRequest = incomingCreateJobRequestResult.value
    const createJobResult = await this.createJobApiService.createJob(incomingCreateJobRequest)
    Result.isFailure(createJobResult)
      ? console.error(`${logCtx} exit failure:`, { createJobResult, incomingCreateJobRequest })
      : console.info(`${logCtx} exit success:`, { createJobResult, incomingCreateJobRequest })

    return createJobResult
  }

  /**
   *
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'CreateJobApiController.parseInputRequest'

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
