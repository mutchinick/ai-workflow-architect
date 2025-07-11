import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import {
  EventClassMap,
  EventStoreEventBuilder,
  IncomingEventBridgeEvent,
} from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { WorkflowStartedEvent } from '../../../events/WorkflowStartedEvent'
import { IContinueWorkflowWorkerService } from '../ContinueWorkflowWorkerService/ContinueWorkflowWorkerService'

export interface IContinueWorkflowWorkerController {
  continueWorkflows: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

const validEventsMap: EventClassMap = {
  [EventStoreEventName.WORKFLOW_STARTED]: WorkflowStartedEvent,
}

/**
 *
 */
export class ContinueWorkflowWorkerController implements IContinueWorkflowWorkerController {
  /**
   *
   */
  constructor(private readonly continueWorkflowWorkerService: IContinueWorkflowWorkerService) {}

  /**
   *
   */
  public async continueWorkflows(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logCtx = 'ContinueWorkflowWorkerController.continueWorkflows'
    console.info(`${logCtx} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { invalidArgsFailure, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      // If the failure is transient then we add it to the batch errors to requeue and retry
      // If the failure is non-transient then we ignore it to remove it from the queue
      const startWorkflowResult = await this.continueWorkflowSafe(record)
      if (Result.isFailureTransient(startWorkflowResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logCtx} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async continueWorkflowSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ContinueWorkflowWorkerController.continueWorkflowSafe'
    console.info(`${logCtx} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingEventBridgeEvent
    const incomingStartWorkflowEventResult = EventStoreEventBuilder.fromEventBridge(validEventsMap, unverifiedEvent)
    if (Result.isFailure(incomingStartWorkflowEventResult)) {
      console.error(`${logCtx} failure exit:`, { incomingStartWorkflowEventResult, unverifiedEvent })
      return incomingStartWorkflowEventResult
    }

    const incomingStartWorkflowEvent = incomingStartWorkflowEventResult.value
    if (incomingStartWorkflowEvent instanceof WorkflowStartedEvent === false) {
      const message = `Expected WorkflowStartedEvent but got ${incomingStartWorkflowEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingStartWorkflowEvent })
      return failure
    }

    const startWorkflowResult = await this.continueWorkflowWorkerService.continueWorkflow(incomingStartWorkflowEvent)
    Result.isFailure(startWorkflowResult)
      ? console.error(`${logCtx} exit failure:`, { startWorkflowResult, incomingStartWorkflowEvent })
      : console.info(`${logCtx} exit success:`, { startWorkflowResult, incomingStartWorkflowEvent })

    return startWorkflowResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ContinueWorkflowWorkerController.parseInputEvent'

    try {
      const unverifiedEvent = JSON.parse(sqsRecord.body)
      return Result.makeSuccess<unknown>(unverifiedEvent)
    } catch (error) {
      console.error(`${logCtx} error caught:`, { error, sqsRecord })
      const invalidArgsFailure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { invalidArgsFailure, sqsRecord })
      return invalidArgsFailure
    }
  }
}
