import KSUID from 'ksuid'
import z from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { TypeUtilsPretty } from '../../shared/TypeUtils'
import { Assistant } from '../assistants/Assistant'
import { WorkflowStep, workflowStepSchema } from './WorkflowStep'

/**
 *
 */
const workflowInstructionsSchema = z.object({
  query: z.string().trim().min(6),
})

export type WorkflowInstructions = TypeUtilsPretty<z.infer<typeof workflowInstructionsSchema>>

/**
 *
 */
export const workflowPropsSchema = z.object({
  workflowId: z.string().trim().min(6),
  instructions: workflowInstructionsSchema,
  steps: z.array(workflowStepSchema),
})

export type WorkflowProps = z.infer<typeof workflowPropsSchema>

// constants
const EXECUTION_ORDER_ID_LENGTH = 4

/**
 *
 */
export class Workflow implements WorkflowProps {
  /**
   *
   */
  private constructor(
    public readonly workflowId: string,
    public readonly instructions: WorkflowInstructions,
    public readonly steps: WorkflowStep[],
  ) {}

  /**
   *
   */
  public static fromInstructions(
    workflowInstructions: WorkflowInstructions,
  ): Success<Workflow> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.fromInput'
    console.info(`${logCtx} init:`, { workflowInstructions })

    const instructionsResult = this.parseValidateInstructions(workflowInstructions)
    if (Result.isFailure(instructionsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult: instructionsResult })
      return instructionsResult
    }
    const instructions = instructionsResult.value

    const workflowId = this.generateWorkflowId(instructions)
    const workflow = new Workflow(workflowId, instructions, [])
    const workflowResult = Result.makeSuccess(workflow)
    console.info(`${logCtx} exit success:`, { workflowResult, workflowInstructions })
    return workflowResult
  }

  /**
   *
   */
  private static parseValidateInstructions(
    instructions: WorkflowInstructions,
  ): Success<WorkflowInstructions> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.parseValidateInstructions'

    try {
      const validInstructions = workflowInstructionsSchema.parse(instructions)
      return Result.makeSuccess(validInstructions)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, instructions })
      return failure
    }
  }

  /**
   *
   */
  private static generateWorkflowId(instructions: WorkflowInstructions): string {
    const datePart = this.normalizeText(new Date().toISOString())
    const queryPart = this.normalizeText(instructions.query.trim().slice(0, 20))
    const ksuidPart = KSUID.randomSync().string
    const workflowId = `workflow-${datePart}-${queryPart}-${ksuidPart}`
    return workflowId
  }

  /**
   *
   */
  public static fromProps(props: WorkflowProps): Success<Workflow> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.fromProps'
    console.info(`${logCtx} init:`, { props })

    const propsResult = this.parseValidateProps(props)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, props })
      return propsResult
    }

    const { workflowId, instructions, steps } = propsResult.value
    const workflow = new Workflow(workflowId, instructions, steps)
    const workflowResult = Result.makeSuccess(workflow)
    console.info(`${logCtx} exit success:`, { workflowResult })
    return workflowResult
  }

  /**
   *
   */
  private static parseValidateProps(props: WorkflowProps): Success<WorkflowProps> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.parseValidateProps'

    try {
      const validProps = workflowPropsSchema.parse(props)
      return Result.makeSuccess(validProps)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, props })
      return failure
    }
  }

  /**
   *
   */
  getObjectKey(): string {
    const workflowKey = `${this.workflowId}`
    const baseKey = `${workflowKey}/${workflowKey}`

    const executedSteps = this.steps.filter((step) => step.stepStatus === 'completed')
    if (executedSteps.length === 0) {
      const executionOrderId = Workflow.zeroPad(0, EXECUTION_ORDER_ID_LENGTH)
      const createdKey = `${baseKey}-x${executionOrderId}-created.json`
      return createdKey
    }

    const latestExecutedStep = executedSteps[executedSteps.length - 1]
    const objectKey = `${baseKey}-${latestExecutedStep.stepId}.json`
    return objectKey
  }

  /**
   *
   */
  getLastExecutedStep(): WorkflowStep | null {
    const executedSteps = this.steps.filter((step) => step.stepStatus === 'completed')
    if (executedSteps.length === 0) {
      return null
    }
    return executedSteps[executedSteps.length - 1]
  }

  /**
   *
   */
  getCurrentStep(): WorkflowStep | null {
    return this.steps.find((step) => step.stepStatus === 'pending') || null
  }

  /**
   *
   */
  completeStep(stepId: string, llmPrompt: string, llmResult: string): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.completeStep'
    console.info(`${logCtx} init:`, { stepId, llmPrompt, llmResult })

    const currentStep = this.getCurrentStep()
    if (!currentStep) {
      const message = 'No current step to complete'
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, stepId, llmPrompt, llmResult })
      return failure
    }

    currentStep.llmPrompt = llmPrompt
    currentStep.llmResult = llmResult
    currentStep.stepStatus = 'completed'

    console.info(`${logCtx} exit success:`, { stepId, llmPrompt, llmResult })
    return Result.makeSuccess()
  }

  /**
   *
   */
  hasCompleted(): boolean {
    return this.steps.length > 0 && this.steps.every((step) => step.stepStatus === 'completed')
  }

  /**
   *
   */
  deployAssistants(
    system: string,
    prompt: string,
    result: string,
    assistant: Assistant,
    assistants: Assistant[],
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.deployAssistants'
    console.info(`${logCtx} init:`, { assistants })

    if (this.steps.length > 0) {
      const message = `Cannot deploy assistants after workflow steps have been initialized`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, assistants })
      return failure
    }

    let executionOrder = 1

    // Populate the 'deploy_assistants' steps
    {
      const executionOrderId = Workflow.zeroPad(executionOrder, EXECUTION_ORDER_ID_LENGTH)
      const deployStep: WorkflowStep = {
        stepId: `x${executionOrderId}-deploy-assistants`,
        stepStatus: 'completed',
        executionOrder,
        assistant,
        llmSystem: system,
        llmPrompt: prompt,
        llmResult: result,
      }
      this.steps.push(deployStep)
    }

    // Populate the 'assistant' steps
    for (const assistant of assistants) {
      executionOrder++
      const executionOrderId = Workflow.zeroPad(executionOrder, EXECUTION_ORDER_ID_LENGTH)
      const stepId = Workflow.normalizeText(`x${executionOrderId}-assistant-${assistant.name}`)
      const step: WorkflowStep = {
        stepId,
        stepStatus: 'pending',
        executionOrder,
        assistant,
        llmSystem: assistant.system,
        llmPrompt: assistant.prompt,
        llmResult: '',
      }
      this.steps.push(step)
    }

    const deployAssistantsResult = Result.makeSuccess()
    console.info(`${logCtx} exit success:`, { deployAssistantsResult, assistants })
    return deployAssistantsResult
  }

  /**
   *
   */
  public toJSON(): WorkflowProps {
    return {
      workflowId: this.workflowId,
      instructions: this.instructions,
      steps: this.steps,
    }
  }

  /**
   *
   */
  private static zeroPad(num: number, size: number): string {
    let s = num.toString()
    while (s.length < size) {
      s = '0' + s
    }
    return s
  }

  /**
   *
   */
  private static normalizeText(str: string): string {
    return str
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-')
  }
}
