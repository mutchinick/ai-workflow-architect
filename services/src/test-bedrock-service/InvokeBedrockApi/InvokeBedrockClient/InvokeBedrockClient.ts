import { APICallError, GenerateTextResult, LanguageModel } from 'ai'
import { Failure, Result, Success } from '../../../errors/Result'

interface GenerationConfig {
  model: LanguageModel
  system?: string
  prompt: string
}

type GenerateTextFunction = (config: GenerationConfig) => Promise<GenerateTextResult<Record<string, never>, string>>

export interface IInvokeBedrockClient {
  /**
   *
   */
  invoke: (
    system: string,
    prompt: string,
  ) => Promise<
    | Success<string>
    | Failure<'InvalidArgumentsError'>
    | Failure<'TestBedrockTransientError'>
    | Failure<'TestBedrockPermanentError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class InvokeBedrockClient implements IInvokeBedrockClient {
  /**
   *
   */
  constructor(
    private readonly model: LanguageModel,
    private readonly generateTextFn: GenerateTextFunction,
  ) {}

  /**
   *
   */
  public async invoke(
    system: string,
    prompt: string,
  ): Promise<
    | Success<string>
    | Failure<'InvalidArgumentsError'>
    | Failure<'TestBedrockTransientError'>
    | Failure<'TestBedrockPermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockClient.invoke'
    console.info(`${logCtx} init:`, { system, prompt })

    const inputValidationResult = this.validateInput(prompt)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult })
      return inputValidationResult
    }

    const generationConfig = this.buildGenerationConfig(system, prompt)

    const sendRequestResult = await this.sendGenerationRequest(generationConfig)

    Result.isFailure(sendRequestResult)
      ? console.error(`${logCtx} exit failure:`, { sendRequestResult })
      : console.info(`${logCtx} exit success`)

    return sendRequestResult
  }

  /**
   *
   */
  private validateInput(prompt: string): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'InvokeBedrockClient.validateInput'

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      const message = `Missing or invalid prompt`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildGenerationConfig(system: string, prompt: string): GenerationConfig {
    return {
      model: this.model,
      system: system || undefined,
      prompt,
    }
  }

  /**
   *
   */
  private async sendGenerationRequest(
    config: GenerationConfig,
  ): Promise<
    | Success<string>
    | Failure<'TestBedrockTransientError'>
    | Failure<'TestBedrockPermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockClient.sendGenerationRequest'

    try {
      const { text } = await this.generateTextFn(config)
      return Result.makeSuccess(text)
    } catch (error) {
      console.error(`${logCtx} error caught:`, { error })

      if (error instanceof APICallError) {
        if (error.isRetryable) {
          const transientFailure = Result.makeFailure('TestBedrockTransientError', error.message, true)
          console.error(`${logCtx} exit failure:`, { transientFailure })
          return transientFailure
        } else {
          const permanentFailure = Result.makeFailure('TestBedrockPermanentError', error.message, false)
          console.error(`${logCtx} exit failure:`, { permanentFailure })
          return permanentFailure
        }
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', String(error), true)
      console.error(`${logCtx} exit failure:`, { failure: unrecognizedFailure })
      return unrecognizedFailure
    }
  }
}
