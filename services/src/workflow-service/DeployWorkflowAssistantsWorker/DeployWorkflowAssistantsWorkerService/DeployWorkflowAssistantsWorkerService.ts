import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { Assistant } from '../../assistants/Assistant'
import { WorkflowArchitectAssistant } from '../../assistants/WorkflowArchitectAssistant'
import {
  WorkflowAssistantsDeployedEvent,
  WorkflowAssistantsDeployedEventData,
} from '../../events/WorkflowAssistantsDeployedEvent'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IInvokeBedrockClient } from '../../InvokeBedrockClient/InvokeBedrockClient'
import { IReadWorkflowClient } from '../../models/ReadWorkflowClient'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'

export interface IDeployWorkflowAssistantsWorkerService {
  deployWorkflowAssistants: (
    incomingEvent: WorkflowCreatedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'WorkflowFileSaveCollisionError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  >
}

type DesignAssistantsOutput = {
  system: string
  prompt: string
  result: string
  assistants: Assistant[]
}

/**
 *
 */
export class DeployWorkflowAssistantsWorkerService implements IDeployWorkflowAssistantsWorkerService {
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
  public async deployWorkflowAssistants(
    incomingEvent: WorkflowCreatedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'WorkflowFileSaveCollisionError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAssistantsWorkerService.deployWorkflowAssistants'
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
    const designAssistantsResult = await this.designAssistants(workflow)
    if (Result.isFailure(designAssistantsResult)) {
      console.error(`${logCtx} exit failure:`, { designAssistantsResult, incomingEvent })
      return designAssistantsResult
    }

    const { system, prompt, result, assistants } = designAssistantsResult.value
    const loadAssistantsResult = workflow.loadAssistants(system, prompt, result, WorkflowArchitectAssistant, assistants)
    if (Result.isFailure(loadAssistantsResult)) {
      console.error(`${logCtx} exit failure:`, { loadAssistantsResult, incomingEvent })
      return loadAssistantsResult
    }

    const saveWorkflowResult = await this.saveWorkflow(workflow)
    if (Result.isFailure(saveWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { saveWorkflowResult, incomingEvent })
      return saveWorkflowResult
    }

    const publishEventResult = await this.publishWorkflowAssistantsDeployedEvent(workflow)
    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, incomingEvent })
      : console.info(`${logCtx} exit success:`, { publishEventResult, incomingEvent })

    return publishEventResult
  }

  /**
   *
   */
  private validateInput(incomingEvent: WorkflowCreatedEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'DeployWorkflowAssistantsWorkerService.validateInput'
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
    const logCtx = 'DeployWorkflowAssistantsWorkerService.readWorkflow'
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
  private async designAssistants(
    workflow: Workflow,
  ): Promise<
    | Success<DesignAssistantsOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAssistantsWorkerService.designAssistants'
    console.info(`${logCtx} init:`, { workflow: JSON.stringify(workflow) })

    const userQuery = workflow.instructions.query
    const { system, prompt: rawPrompt } = WorkflowArchitectAssistant
    const prompt = rawPrompt.replace('<question>{{USER_QUESTION}}</question>', `<query>${userQuery}</query>`)

    const invokeBedrockResult = await this.invokeBedrockClient.invoke(system, prompt)
    if (Result.isFailure(invokeBedrockResult)) {
      console.error(`${logCtx} exit failure:`, { invokeBedrockResult, workflow })
      return invokeBedrockResult
    }

    try {
      const assistantsString = invokeBedrockResult.value
      const assistants: Assistant[] = JSON.parse(assistantsString)
      const assistantsWithRules = this.addResponseRules(assistants)
      const designAssistantsOutput: DesignAssistantsOutput = {
        system,
        prompt,
        result: assistantsString,
        assistants: assistantsWithRules,
      }
      const assistantsResult = Result.makeSuccess(designAssistantsOutput)
      console.info(`${logCtx} exit success:`, { assistantsResult, workflow })
      return assistantsResult
    } catch (error) {
      const message = `Failed to parse assistants from completion: ${error}`
      const failure = Result.makeFailure('UnrecognizedError', message, true)
      console.error(`${logCtx} exit failure:`, { failure, invokeBedrockResult, workflow })
      return failure
    }
  }

  /**
   *
   */
  private addResponseRules(assistants: Assistant[]): Assistant[] {
    const assistantsWithRules = assistants.map((assistant) => {
      const responseRules = `
        Your response must contain only the direct answer or requested content; 
        **IT MUST NOT include any commentary, conversational filler, or emojis.**`
      return { ...assistant, system: `${assistant.system}\n${responseRules}` }
    })

    return assistantsWithRules
  }

  /**
   *
   */
  private async saveWorkflow(
    workflow: Workflow,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'UnrecognizedError'>
    | Failure<'WorkflowFileSaveCollisionError'>
  > {
    const logCtx = 'DeployWorkflowAssistantsWorkerService.saveWorkflow'
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
  private async publishWorkflowAssistantsDeployedEvent(
    workflow: Workflow,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAssistantsWorkerService.publishWorkflowAssistantsDeployedEvent'
    console.info(`${logCtx} init:`, { workflow })

    const workflowId = workflow.workflowId
    const objectKey = workflow.getObjectKey()
    const eventData: WorkflowAssistantsDeployedEventData = { workflowId, objectKey }
    const buildEventResult = WorkflowAssistantsDeployedEvent.fromData(eventData)
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
