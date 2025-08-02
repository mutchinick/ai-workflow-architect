import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import {
  EventClassMap,
  EventStoreEventBuilder,
  IncomingEventBridgeEvent,
} from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { WorkflowStepProcessedEvent } from '../../events/WorkflowStepProcessedEvent'
import { WorkflowAgentsDeployedEvent } from '../../events/WorkflowAgentsDeployedEvent'
import { IProcessWorkflowStepWorkerService } from '../ProcessWorkflowStepWorkerService/ProcessWorkflowStepWorkerService'

export interface IProcessWorkflowStepWorkerController {
  processWorkflowStep: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

const validEventsMap: EventClassMap = {
  [EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED_EVENT]: WorkflowAgentsDeployedEvent,
  [EventStoreEventName.WORKFLOW_STEP_PROCESSED_EVENT]: WorkflowStepProcessedEvent,
}

/**
 *
 */
export class ProcessWorkflowStepWorkerController implements IProcessWorkflowStepWorkerController {
  /**
   *
   */
  constructor(private readonly processWorkflowStepWorkerService: IProcessWorkflowStepWorkerService) {}

  /**
   *
   */
  public async processWorkflowStep(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logCtx = 'ProcessWorkflowStepWorkerController.processWorkflowStep'
    console.info(`${logCtx} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      // If the failure is transient then we add it to the batch errors to requeue and retry
      // If the failure is non-transient then we ignore it to remove it from the queue
      const createWorkflowResult = await this.processWorkflowStepSafe(record)
      if (Result.isFailureTransient(createWorkflowResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logCtx} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async processWorkflowStepSafe(
    sqsRecord: SQSRecord,
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
    const logCtx = 'ProcessWorkflowStepWorkerController.processWorkflowStepSafe'
    console.info(`${logCtx} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingEventBridgeEvent
    const incomingCreateWorkflowEventResult = EventStoreEventBuilder.fromEventBridge(validEventsMap, unverifiedEvent)
    if (Result.isFailure(incomingCreateWorkflowEventResult)) {
      console.error(`${logCtx} failure exit:`, { incomingCreateWorkflowEventResult, unverifiedEvent })
      return incomingCreateWorkflowEventResult
    }

    const incomingCreateWorkflowEvent = incomingCreateWorkflowEventResult.value
    if (
      incomingCreateWorkflowEvent instanceof WorkflowAgentsDeployedEvent === false &&
      incomingCreateWorkflowEvent instanceof WorkflowStepProcessedEvent === false
    ) {
      const message = `Expected WorkflowAgentsDeployedEvent but got ${incomingCreateWorkflowEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingCreateWorkflowEvent })
      return failure
    }

    const createWorkflowResult =
      await this.processWorkflowStepWorkerService.processWorkflowStep(incomingCreateWorkflowEvent)
    Result.isFailure(createWorkflowResult)
      ? console.error(`${logCtx} exit failure:`, { createWorkflowResult, incomingCreateWorkflowEvent })
      : console.info(`${logCtx} exit success:`, { createWorkflowResult, incomingCreateWorkflowEvent })

    return createWorkflowResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ProcessWorkflowStepWorkerController.parseInputEvent'

    try {
      const unverifiedEvent = JSON.parse(sqsRecord.body)
      return Result.makeSuccess<unknown>(unverifiedEvent)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, sqsRecord })
      return failure
    }
  }
}
