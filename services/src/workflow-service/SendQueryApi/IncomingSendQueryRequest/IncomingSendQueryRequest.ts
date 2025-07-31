import { z } from 'zod'
import { Failure, Result, Success } from '../../../errors/Result'

// Zod schema
const propsSchema = z.object({
  query: z.string().trim().min(6),
})

export type IncomingSendQueryRequestProps = z.infer<typeof propsSchema>

/**
 *
 */
export class IncomingSendQueryRequest implements IncomingSendQueryRequestProps {
  /**
   *
   */
  private constructor(public readonly query: string) {}

  /**
   *
   */
  public static fromProps(
    props: IncomingSendQueryRequestProps,
  ): Success<IncomingSendQueryRequest> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingSendQueryRequest.fromInput'
    console.info(`${logCtx} init:`, { props })

    const propsResult = this.parseValidateProps(props)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, props })
      return propsResult
    }

    const { query } = propsResult.value
    const incomingSendQueryRequest = new IncomingSendQueryRequest(query)
    const incomingSendQueryRequestResult = Result.makeSuccess(incomingSendQueryRequest)
    console.info(`${logCtx} exit success:`, { incomingSendQueryRequestResult })
    return incomingSendQueryRequestResult
  }

  /**
   *
   */
  private static parseValidateProps(
    props: IncomingSendQueryRequestProps,
  ): Success<IncomingSendQueryRequestProps> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingSendQueryRequest.parseValidateProps'

    try {
      const validInput = propsSchema.parse(props)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, props })
      return failure
    }
  }
}
