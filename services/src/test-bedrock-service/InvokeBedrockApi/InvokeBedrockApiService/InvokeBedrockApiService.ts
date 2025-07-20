import { Failure, Result, Success } from '../../../errors/Result'
import { IncomingInvokeBedrockRequest } from '../IncomingInvokeBedrockRequest/IncomingInvokeBedrockRequest'
import { IInvokeBedrockClient } from '../InvokeBedrockClient/InvokeBedrockClient'

export interface IInvokeBedrockApiService {
  invokeBedrock: (
    incomingRequest: IncomingInvokeBedrockRequest,
  ) => Promise<
    | Success<InvokeBedrockApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  >
}

export type InvokeBedrockApiServiceOutput = {
  completion: string
}

/**
 *
 */
export class InvokeBedrockApiService implements IInvokeBedrockApiService {
  /**
   *
   */
  constructor(private readonly invokeBedrockClient: IInvokeBedrockClient) {}

  /**
   *
   */
  public async invokeBedrock(
    incomingRequest: IncomingInvokeBedrockRequest,
  ): Promise<
    | Success<InvokeBedrockApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockApiService.invokeBedrock'
    console.info(`${logCtx} init:`, { incomingRequest })

    const inputValidationResult = this.validateInput(incomingRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingRequest })
      return inputValidationResult
    }

    const invocationResult = await this.invoke(incomingRequest)
    if (Result.isFailure(invocationResult)) {
      console.error(`${logCtx} exit failure:`, { invocationResult, incomingRequest })
      return invocationResult
    }

    const serviceOutput: InvokeBedrockApiServiceOutput = {
      completion: invocationResult.value,
    }
    const serviceResult = Result.makeSuccess(serviceOutput)
    console.info(`${logCtx} exit success:`, { serviceResult, incomingRequest })
    return serviceResult
  }

  /**
   *
   */
  private validateInput(
    incomingRequest: IncomingInvokeBedrockRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'InvokeBedrockApiService.validateInput'
    console.info(`${logCtx} init:`, { incomingRequest })

    if (incomingRequest instanceof IncomingInvokeBedrockRequest === false) {
      const message = `Expected IncomingInvokeBedrockRequest but got ${incomingRequest}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingRequest })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async invoke(
    incomingRequest: IncomingInvokeBedrockRequest,
  ): Promise<
    | Success<string>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockApiService.invoke'
    console.info(`${logCtx} init:`, { incomingRequest })

    const { system, prompt } = incomingRequest
    const invocationResult = await this.invokeBedrockClient.invoke(system, prompt)

    Result.isFailure(invocationResult)
      ? console.error(`${logCtx} exit failure:`, { invocationResult, incomingRequest })
      : console.info(`${logCtx} exit success:`, { invocationResult, incomingRequest })

    return invocationResult
  }
}
