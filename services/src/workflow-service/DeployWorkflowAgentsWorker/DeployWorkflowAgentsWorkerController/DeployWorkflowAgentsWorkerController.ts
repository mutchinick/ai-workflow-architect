import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import {
  EventClassMap,
  EventStoreEventBuilder,
  IncomingEventBridgeEvent,
} from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { WorkflowAgentsDeployedEvent } from '../../events/WorkflowAgentsDeployedEvent'
import { WorkflowCreatedEvent } from '../../events/WorkflowCreatedEvent'
import { IDeployWorkflowAgentsWorkerService } from '../DeployWorkflowAgentsWorkerService/DeployWorkflowAgentsWorkerService'

export interface IDeployWorkflowAgentsWorkerController {
  deployWorkflowAgents: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

const validEventsMap: EventClassMap = {
  [EventStoreEventName.WORKFLOW_CREATED_EVENT]: WorkflowCreatedEvent,
  [EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED_EVENT]: WorkflowAgentsDeployedEvent,
}

/**
 *
 */
export class DeployWorkflowAgentsWorkerController implements IDeployWorkflowAgentsWorkerController {
  /**
   *
   */
  constructor(private readonly deployWorkflowAgentsWorkerService: IDeployWorkflowAgentsWorkerService) {}

  /**
   *
   */
  public async deployWorkflowAgents(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logCtx = 'DeployWorkflowAgentsWorkerController.deployWorkflowAgents'
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
      const createWorkflowResult = await this.deployWorkflowAgentsSafe(record)
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
  private async deployWorkflowAgentsSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'DeployWorkflowAgentsWorkerController.deployWorkflowAgentsSafe'
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
      incomingCreateWorkflowEvent instanceof WorkflowCreatedEvent === false &&
      incomingCreateWorkflowEvent instanceof WorkflowAgentsDeployedEvent === false
    ) {
      const message = `Expected WorkflowCreatedEvent but got ${incomingCreateWorkflowEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingCreateWorkflowEvent })
      return failure
    }

    const createWorkflowResult =
      await this.deployWorkflowAgentsWorkerService.deployWorkflowAgents(incomingCreateWorkflowEvent)
    Result.isFailure(createWorkflowResult)
      ? console.error(`${logCtx} exit failure:`, { createWorkflowResult, incomingCreateWorkflowEvent })
      : console.info(`${logCtx} exit success:`, { createWorkflowResult, incomingCreateWorkflowEvent })

    return createWorkflowResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'DeployWorkflowAgentsWorkerController.parseInputEvent'

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
