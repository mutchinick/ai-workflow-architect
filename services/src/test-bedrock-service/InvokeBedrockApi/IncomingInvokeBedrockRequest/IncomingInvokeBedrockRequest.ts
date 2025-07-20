import { z } from 'zod'
import { Failure, Result, Success } from '../../../errors/Result'

// Zod schema
const propsSchema = z.object({
  system: z.string().optional(),
  prompt: z.string().trim().min(6),
})

export type IncomingInvokeBedrockRequestProps = z.infer<typeof propsSchema>

/**
 *
 */
export class IncomingInvokeBedrockRequest implements IncomingInvokeBedrockRequestProps {
  /**
   *
   */
  private constructor(
    public readonly system: string | undefined,
    public readonly prompt: string,
  ) {}

  /**
   *
   */
  public static fromProps(
    props: IncomingInvokeBedrockRequestProps,
  ): Success<IncomingInvokeBedrockRequest> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingInvokeBedrockRequest.fromInput'
    console.info(`${logCtx} init:`, { props })

    const propsResult = this.parseValidateProps(props)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, props })
      return propsResult
    }

    const { system, prompt } = propsResult.value
    const incomingInvokeBedrockRequest = new IncomingInvokeBedrockRequest(system, prompt)
    const incomingInvokeBedrockRequestResult = Result.makeSuccess(incomingInvokeBedrockRequest)
    console.info(`${logCtx} exit success:`, { incomingInvokeBedrockRequestResult })
    return incomingInvokeBedrockRequestResult
  }

  /**
   *
   */
  private static parseValidateProps(
    input: IncomingInvokeBedrockRequestProps,
  ): Success<IncomingInvokeBedrockRequestProps> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingInvokeBedrockRequest.parseValidateProps'

    try {
      const validInput = propsSchema.parse(input)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, input })
      return failure
    }
  }
}
