import { z } from 'zod'
import { Failure, Result, Success } from '../../../errors/Result'

export type IncomingCreateJobRequestInput = {
  jobId: string
}

type IncomingCreateJobRequestProps = {
  jobId: string
}

/**
 *
 */
export class IncomingCreateJobRequest implements IncomingCreateJobRequestProps {
  /**
   *
   */
  private constructor(public readonly jobId: string) {}

  /**
   *
   */
  public static fromInput(
    incomingCreateJobRequestInput: IncomingCreateJobRequestInput,
  ): Success<IncomingCreateJobRequest> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingCreateJobRequest.fromInput'
    console.info(`${logCtx} init:`, { incomingCreateJobRequestInput })

    const propsResult = this.buildProps(incomingCreateJobRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, incomingCreateJobRequestInput })
      return propsResult
    }

    const { jobId } = propsResult.value
    const incomingCreateJobRequest = new IncomingCreateJobRequest(jobId)
    const incomingCreateJobRequestResult = Result.makeSuccess(incomingCreateJobRequest)
    console.info(`${logCtx} exit success:`, { incomingCreateJobRequestResult })
    return incomingCreateJobRequestResult
  }

  /**
   *
   */
  private static buildProps(
    incomingCreateJobRequestInput: IncomingCreateJobRequestInput,
  ): Success<IncomingCreateJobRequestProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.parseValidateInput(incomingCreateJobRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { jobId } = incomingCreateJobRequestInput
    const incomingCreateJobRequestProps: IncomingCreateJobRequestProps = { jobId }
    return Result.makeSuccess(incomingCreateJobRequestProps)
  }

  /**
   *
   */
  private static parseValidateInput(
    input: IncomingCreateJobRequestInput,
  ): Success<IncomingCreateJobRequestInput> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingCreateJobRequest.validateInput'

    const schema = z.object({
      jobId: z.string().trim().min(6),
    })

    try {
      const validInput = schema.parse(input)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, input })
      return failure
    }
  }
}
