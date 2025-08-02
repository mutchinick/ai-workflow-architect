import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { Agent } from '../../agents/Agent'
import { AgentsDesignerAgent, WORKFLOW_PHASES } from '../../agents/AgentsDesignerAgent'
import { WorkflowAgentsDeployedEvent, WorkflowAgentsDeployedEventData } from '../../events/WorkflowAgentsDeployedEvent'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IInvokeBedrockClient } from '../../InvokeBedrockClient/InvokeBedrockClient'
import { IReadWorkflowClient } from '../../models/ReadWorkflowClient'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'

export interface IDeployWorkflowAgentsWorkerService {
  deployWorkflowAgents: (
    incomingEvent: WorkflowCreatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'DuplicateWorkflowError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  >
}

type DesignAgentsOutput = {
  system: string
  prompt: string
  result: string
  agents: Agent[]
}

/**
 *
 */
export class DeployWorkflowAgentsWorkerService implements IDeployWorkflowAgentsWorkerService {
  /**
   *
   */
  constructor(
    private readonly readWorkflowClient: IReadWorkflowClient,
    private readonly invokeBedrockClient: IInvokeBedrockClient,
    private readonly saveWorkflowClient: ISaveWorkflowClient,
    private readonly eventStoreClient: IEventStoreClient,
  ) {}

  /**
   *
   */
  public async deployWorkflowAgents(
    incomingEvent: WorkflowCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'DuplicateWorkflowError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAgentsWorkerService.deployWorkflowAgents'
    console.info(`${logCtx} init:`, { incomingEvent })

    const inputValidationResult = this.validateInput(incomingEvent)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingEvent })
      return inputValidationResult
    }

    const workflowId = incomingEvent.eventData.workflowId
    const objectKey = incomingEvent.eventData.objectKey
    const readWorkflowResult = await this.readWorkflow(workflowId, objectKey)
    if (Result.isFailure(readWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { readWorkflowResult, incomingEvent })
      return readWorkflowResult
    }

    const workflow = readWorkflowResult.value
    const designAgentsResult = await this.designAgents(workflow)
    if (Result.isFailure(designAgentsResult)) {
      console.error(`${logCtx} exit failure:`, { designAgentsResult, incomingEvent })
      return designAgentsResult
    }

    const { system, prompt, result, agents } = designAgentsResult.value
    const deployAgentsResult = workflow.deployAgents(system, prompt, result, AgentsDesignerAgent, agents)
    if (Result.isFailure(deployAgentsResult)) {
      console.error(`${logCtx} exit failure:`, { deployAgentsResult, incomingEvent })
      return deployAgentsResult
    }

    const saveWorkflowResult = await this.saveWorkflow(workflow)
    if (Result.isFailure(saveWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { saveWorkflowResult, incomingEvent })
      return saveWorkflowResult
    }

    const publishEventResult = await this.publishWorkflowAgentsDeployedEvent(workflow)
    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, incomingEvent })
      : console.info(`${logCtx} exit success:`, { publishEventResult, incomingEvent })

    return publishEventResult
  }

  /**
   *
   */
  private validateInput(incomingEvent: WorkflowCreatedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'DeployWorkflowAgentsWorkerService.validateInput'
    console.info(`${logCtx} init:`, { incomingEvent })

    if (incomingEvent instanceof WorkflowCreatedEvent === false) {
      const message = `Expected WorkflowCreatedEvent but got ${incomingEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingEvent })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async readWorkflow(
    workflowId: string,
    objectKey: string,
  ): Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAgentsWorkerService.readWorkflow'
    console.info(`${logCtx} init:`, { workflowId, objectKey })

    const readWorkflowResult = await this.readWorkflowClient.read(objectKey)
    if (Result.isFailure(readWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { readWorkflowResult, workflowId, objectKey })
      return readWorkflowResult
    }

    console.info(`${logCtx} exit success:`, { readWorkflowResult, workflowId, objectKey })
    return readWorkflowResult
  }

  /**
   *
   */
  private async designAgents(
    workflow: Workflow,
  ): Promise<
    | Success<DesignAgentsOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAgentsWorkerService.designAgents'
    console.info(`${logCtx} init:`, { workflow: JSON.stringify(workflow) })

    const userQuery = workflow.instructions.query
    const { system, prompt: rawPrompt } = AgentsDesignerAgent
    const prompt = rawPrompt.replace('<question>{{USER_QUESTION}}</question>', `<query>${userQuery}</query>`)

    const invokeBedrockResult = await this.invokeBedrockClient.invoke(system, prompt)
    if (Result.isFailure(invokeBedrockResult)) {
      console.error(`${logCtx} exit failure:`, { invokeBedrockResult, workflow })
      return invokeBedrockResult
    }

    try {
      const agentsString = invokeBedrockResult.value
      const agents: Agent[] = JSON.parse(agentsString)
      const enrichedAgents = this.getEnrichedAgentsWithResponseRules(agents)
      const designAgentsOutput: DesignAgentsOutput = { system, prompt, result: agentsString, agents: enrichedAgents }
      const agentsResult = Result.makeSuccess(designAgentsOutput)
      console.info(`${logCtx} exit success:`, { agentsResult, workflow })
      return agentsResult
    } catch (error) {
      const message = `Failed to parse agents from completion: ${error}`
      const failure = Result.makeFailure('UnrecognizedError', message, true)
      console.error(`${logCtx} exit failure:`, { failure, invokeBedrockResult, workflow })
      return failure
    }
  }

  /**
   *
   */
  private getEnrichedAgentsWithResponseRules(agents: Agent[]): Agent[] {
    const responseRulesMap: Record<string, string> = {}
    Object.values(WORKFLOW_PHASES).forEach((phase) => {
      responseRulesMap[phase.name] = phase.responseRules
    })

    const enrichedAgents = agents.map((agent) => {
      const agentPhase = agent.phaseName || ''
      const responseRules = responseRulesMap[agentPhase] || ''
      return {
        ...agent,
        system: `${agent.system}\n${responseRules}`,
      }
    })
    return enrichedAgents
  }

  /**
   *
   */
  private async saveWorkflow(
    workflow: Workflow,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'UnrecognizedError'> | Failure<'DuplicateWorkflowError'>
  > {
    const logCtx = 'DeployWorkflowAgentsWorkerService.saveWorkflow'
    console.info(`${logCtx} init:`, { workflow })

    const saveWorkflowResult = await this.saveWorkflowClient.save(workflow)
    if (Result.isFailure(saveWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { saveWorkflowResult, workflow })
      return saveWorkflowResult
    }

    console.info(`${logCtx} exit success:`, { saveWorkflowResult, workflow })
    return saveWorkflowResult
  }

  /**
   *
   */
  private async publishWorkflowAgentsDeployedEvent(
    workflow: Workflow,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAgentsWorkerService.publishWorkflowAgentsDeployedEvent'
    console.info(`${logCtx} init:`, { workflow })

    const workflowId = workflow.workflowId
    const objectKey = workflow.getObjectKey()
    const eventData: WorkflowAgentsDeployedEventData = { workflowId, objectKey }
    const buildEventResult = WorkflowAgentsDeployedEvent.fromData(eventData)
    if (Result.isFailure(buildEventResult)) {
      console.error(`${logCtx} exit failure:`, { buildEventResult, eventData })
      return buildEventResult
    }

    const event = buildEventResult.value
    const publishEventResult = await this.eventStoreClient.publish(event)
    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, event })
      : console.info(`${logCtx} exit success:`, { publishEventResult, event })

    return publishEventResult
  }
}
