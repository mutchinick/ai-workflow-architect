import { Failure, Result, Success } from '../../../errors/Result'
import { IEventStoreClient } from '../../../event-store/EventStoreClient'
import { EventStoreEvent } from '../../../event-store/EventStoreEvent'
import { WorkflowAssistantsDeployedEvent } from '../../events/WorkflowAssistantsDeployedEvent'
import { WorkflowCompletedEvent } from '../../events/WorkflowCompletedEvent'
import { WorkflowStepProcessedEvent } from '../../events/WorkflowStepProcessedEvent'
import { IInvokeBedrockClient } from '../../InvokeBedrockClient/InvokeBedrockClient'
import { IReadWorkflowClient } from '../../models/ReadWorkflowClient'
import { ISaveWorkflowClient } from '../../models/SaveWorkflowClient'
import { Workflow } from '../../models/Workflow'

export interface IProcessWorkflowStepWorkerService {
  processWorkflowStep: (
    incomingEvent: WorkflowAssistantsDeployedEvent,
  ) => Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'WorkflowAlreadyCompletedError'>
    | Failure<'WorkflowInvalidStateError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'WorkflowFileSaveCollisionError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  >
}

type ExecuteAssistantOutput = {
  llmSystem: string
  llmPrompt: string
  llmResult: string
}

/**
 *
 */
export class ProcessWorkflowStepWorkerService implements IProcessWorkflowStepWorkerService {
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
  public async processWorkflowStep(
    incomingEvent: WorkflowAssistantsDeployedEvent,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'WorkflowAlreadyCompletedError'>
    | Failure<'WorkflowInvalidStateError'>
    | Failure<'WorkflowFileSaveCollisionError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'DuplicateEventError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessWorkflowStepWorkerService.processWorkflowStep'
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
    const executeAssistantResult = await this.executeAssistant(workflow)
    if (Result.isFailure(executeAssistantResult)) {
      console.error(`${logCtx} exit failure:`, { executeAssistantResult, incomingEvent })
      return executeAssistantResult
    }

    const saveWorkflowResult = await this.saveWorkflow(workflow)
    if (Result.isFailure(saveWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { saveWorkflowResult, incomingEvent })
      return saveWorkflowResult
    }

    const publishEventResult = await this.publishWorkflowEvent(workflow)
    Result.isFailure(publishEventResult)
      ? console.error(`${logCtx} exit failure:`, { publishEventResult, incomingEvent })
      : console.info(`${logCtx} exit success:`, { publishEventResult, incomingEvent })

    return publishEventResult
  }

  /**
   *
   */
  private validateInput(incomingEvent: EventStoreEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ProcessWorkflowStepWorkerService.validateInput'
    console.info(`${logCtx} init:`, { incomingEvent })

    if (
      incomingEvent instanceof WorkflowAssistantsDeployedEvent === false &&
      incomingEvent instanceof WorkflowStepProcessedEvent === false
    ) {
      const message = `Expected WorkflowAssistantsDeployedEvent or WorkflowStepProcessedEvent but got ${incomingEvent}`
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
    const logCtx = 'ProcessWorkflowStepWorkerService.readWorkflow'
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
  private async executeAssistant(
    workflow: Workflow,
  ): Promise<
    | Success<ExecuteAssistantOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowAlreadyCompletedError'>
    | Failure<'WorkflowInvalidStateError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessWorkflowStepWorkerService.executeAssistant'
    console.info(`${logCtx} init:`, { workflow: JSON.stringify(workflow) })

    const currentStep = workflow.getCurrentStep()
    if (!currentStep) {
      const message = 'No more steps to process in the workflow'
      const failure = Result.makeFailure('WorkflowAlreadyCompletedError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, workflow })
      return failure
    }

    let llmPrompt = currentStep.llmPrompt
    if (llmPrompt.includes('<PREVIOUS_RESULT>')) {
      // TODO: workflow.getAllPreviousResults() could be used to get all previous results
      const previousResults = workflow.getAllCompletedResults()
      if (!previousResults) {
        const message = 'No previous step to reference for <PREVIOUS_RESULT>'
        const failure = Result.makeFailure('WorkflowInvalidStateError', message, false)
        console.error(`${logCtx} exit failure:`, { failure, workflow })
        return failure
      }
      llmPrompt = llmPrompt.replace('<PREVIOUS_RESULT>', previousResults)
    }

    llmPrompt = `
      The following context has been formed from the contributions of previous assistants in the workflow. 
      Use this context to inform your response and respond according to your system prompt:
      <context>
      ${llmPrompt}
      </context>`

    const llmSystem = currentStep.llmSystem
    const invokeBedrockResult = await this.invokeBedrockClient.invoke(llmSystem, llmPrompt)
    if (Result.isFailure(invokeBedrockResult)) {
      console.error(`${logCtx} exit failure:`, { invokeBedrockResult, workflow })
      return invokeBedrockResult
    }

    const llmResult = invokeBedrockResult.value
    const completeStepResult = workflow.completeStep(currentStep.stepId, llmPrompt, llmResult)
    if (Result.isFailure(completeStepResult)) {
      console.error(`${logCtx} exit failure:`, { completeStepResult, workflow })
      return completeStepResult
    }

    const executeAssistantOutput = { llmSystem, llmPrompt, llmResult }
    const executeAssistantResult = Result.makeSuccess(executeAssistantOutput)
    console.info(`${logCtx} exit success:`, { executeAssistantResult, workflow })
    return executeAssistantResult
  }

  /**
   *
   */
  private async saveWorkflow(
    workflow: Workflow,
  ): Promise<
    | Success<void>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileSaveCollisionError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessWorkflowStepWorkerService.saveWorkflow'
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
  private async publishWorkflowEvent(
    workflow: Workflow,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessWorkflowStepWorkerService.publishWorkflowEvent'
    console.info(`${logCtx} init:`, { workflow })

    const workflowId = workflow.workflowId
    const objectKey = workflow.getObjectKey()
    const eventData = { workflowId, objectKey }

    const buildEventResult = workflow.hasCompleted()
      ? WorkflowCompletedEvent.fromData(eventData)
      : WorkflowStepProcessedEvent.fromData(eventData)

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
