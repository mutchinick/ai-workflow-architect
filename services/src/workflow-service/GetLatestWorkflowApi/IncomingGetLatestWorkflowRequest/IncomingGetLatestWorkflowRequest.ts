import { z } from 'zod'
import { Failure, Result, Success } from '../../../errors/Result'

// Zod schema
const propsSchema = z.object({
  workflowId: z.string().trim().min(6),
})

export type IncomingGetLatestWorkflowRequestProps = z.infer<typeof propsSchema>

/**
 *
 */
export class IncomingGetLatestWorkflowRequest implements IncomingGetLatestWorkflowRequestProps {
  /**
   *
   */
  private constructor(public readonly workflowId: string) {}

  /**
   *
   */
  public static fromProps(
    props: IncomingGetLatestWorkflowRequestProps,
  ): Success<IncomingGetLatestWorkflowRequest> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingGetLatestWorkflowRequest.fromInput'
    console.info(`${logCtx} init:`, { props })

    const propsResult = this.parseValidateProps(props)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, props })
      return propsResult
    }

    const { workflowId } = propsResult.value
    const incomingGetLatestWorkflowRequest = new IncomingGetLatestWorkflowRequest(workflowId)
    const incomingGetLatestWorkflowRequestResult = Result.makeSuccess(incomingGetLatestWorkflowRequest)
    console.info(`${logCtx} exit success:`, { incomingGetLatestWorkflowRequestResult })
    return incomingGetLatestWorkflowRequestResult
  }

  /**
   *
   */
  private static parseValidateProps(
    props: IncomingGetLatestWorkflowRequestProps,
  ): Success<IncomingGetLatestWorkflowRequestProps> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingGetLatestWorkflowRequest.parseValidateProps'

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
