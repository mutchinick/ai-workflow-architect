import KSUID from 'ksuid'
import z from 'zod'
import { Failure, Result, Success } from '../../errors/Result'
import { TypeUtilsPretty } from '../../shared/TypeUtils'
import { Agent } from '../agents/Agent'
import { WorkflowStep, workflowStepSchema } from './WorkflowStep'

/**
 *
 */
const instructionsSchema = z.object({
  query: z.string().trim().min(6),
})

export type WorkflowInstructions = TypeUtilsPretty<z.infer<typeof instructionsSchema>>

/**
 *
 */
export const workflowPropsSchema = z.object({
  workflowId: z.string().trim().min(6),
  instructions: instructionsSchema,
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
    console.info(`${logCtx} init:`, { workflowQuery: workflowInstructions })

    const workflowId = KSUID.randomSync().string

    const propsResult = this.parseValidateProps({
      workflowId,
      instructions: { ...workflowInstructions },
      steps: [],
    })
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult })
      return propsResult
    }

    const { instructions, steps } = propsResult.value
    const workflow = new Workflow(workflowId, instructions, steps)
    const workflowResult = Result.makeSuccess(workflow)
    console.info(`${logCtx} exit success:`, { workflowResult })
    return workflowResult
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
      const validInput = workflowPropsSchema.parse(props)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, props })
      return failure
    }
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
  getObjectKey(): string {
    const workflowKey = `workflow-${this.workflowId}`
    const baseKey = `${workflowKey}/${workflowKey}`

    const executedSteps = this.steps.filter((step) => step.stepStatus === 'completed')
    if (executedSteps.length === 0) {
      const executionOrderId = this.zeroPad(0, EXECUTION_ORDER_ID_LENGTH)
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
  lastExecutedStep(): WorkflowStep | null {
    const executedSteps = this.steps.filter((step) => step.stepStatus === 'completed')
    if (executedSteps.length === 0) {
      return null
    }
    return executedSteps[executedSteps.length - 1]
  }

  /**
   *
   */
  nextStep(): WorkflowStep | null {
    return this.steps.find((step) => step.stepStatus === 'pending') || null
  }

  /**
   *
   */
  deployAgents(
    system: string,
    prompt: string,
    result: string,
    agent: Agent,
    agents: Agent[],
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'Workflow.deployAgents'
    console.info(`${logCtx} init:`, { agents })

    if (this.steps.length > 0) {
      const message = `Cannot deploy agents after workflow steps have been initialized`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, agents })
      return failure
    }

    let executionOrder = 1

    // Populate the 'deploy_agents' steps
    {
      const executionOrderId = this.zeroPad(executionOrder, EXECUTION_ORDER_ID_LENGTH)
      const deployStep: WorkflowStep = {
        stepId: `x${executionOrderId}-deploy-agents`,
        stepStatus: 'completed',
        executionOrder,
        agent,
        llmSystem: system,
        llmPrompt: prompt,
        llmResult: result,
      }
      this.steps.push(deployStep)
    }

    // Populate the 'agent' steps
    for (const agent of agents) {
      executionOrder++
      const executionOrderId = this.zeroPad(executionOrder, EXECUTION_ORDER_ID_LENGTH)
      const stepId = this.normalizeStepId(`x${executionOrderId}-agent-${agent.name}`)
      const step: WorkflowStep = {
        stepId,
        stepStatus: 'pending',
        executionOrder,
        agent,
        llmSystem: agent.system,
        llmPrompt: agent.prompt,
        llmResult: '',
      }
      this.steps.push(step)
    }

    const deployAgentsResult = Result.makeSuccess()
    console.info(`${logCtx} exit success:`, { deployAgentsResult, agents })
    return deployAgentsResult
  }

  /**
   *
   */
  private zeroPad(num: number, size: number): string {
    let s = num.toString()
    while (s.length < size) {
      s = '0' + s
    }
    return s
  }

  /**
   * Normalizes the step ID by removing spaces and unfriendly character and replacing them with hyphens.
   */
  private normalizeStepId(stepId: string): string {
    return stepId.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
  }
}
