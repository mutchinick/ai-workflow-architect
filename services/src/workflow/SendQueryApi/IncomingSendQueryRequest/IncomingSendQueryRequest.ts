import { z } from 'zod'
import { Failure, Result, Success } from '../../../errors/Result'

// Zod schema
const propsSchema = z.object({
  query: z.string().trim().min(6),
  promptEnhanceRounds: z.number().int().min(1).max(10),
  responseEnhanceRounds: z.number().int().min(1).max(10),
})

export type IncomingSendQueryRequestProps = z.infer<typeof propsSchema>

/**
 *
 */
export class IncomingSendQueryRequest implements IncomingSendQueryRequestProps {
  /**
   *
   */
  private constructor(
    public readonly query: string,
    public readonly promptEnhanceRounds: number,
    public readonly responseEnhanceRounds: number,
  ) {}

  /**
   *
   */
  public static fromProps(
    incomingSendQueryRequestProps: IncomingSendQueryRequestProps,
  ): Success<IncomingSendQueryRequest> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingSendQueryRequest.fromInput'
    console.info(`${logCtx} init:`, { incomingSendQueryRequestProps })

    const propsResult = this.parseValidateProps(incomingSendQueryRequestProps)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, incomingSendQueryRequestProps })
      return propsResult
    }

    const { query, promptEnhanceRounds, responseEnhanceRounds } = propsResult.value
    const incomingSendQueryRequest = new IncomingSendQueryRequest(query, promptEnhanceRounds, responseEnhanceRounds)
    const incomingSendQueryRequestResult = Result.makeSuccess(incomingSendQueryRequest)
    console.info(`${logCtx} exit success:`, { incomingSendQueryRequestResult })
    return incomingSendQueryRequestResult
  }

  /**
   *
   */
  private static parseValidateProps(
    input: IncomingSendQueryRequestProps,
  ): Success<IncomingSendQueryRequestProps> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingSendQueryRequest.parseValidateProps'

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
