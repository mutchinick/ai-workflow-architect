import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { Failure, Result, Success } from '../../../errors/Result'
import {
  EventClassMap,
  EventStoreEventBuilder,
  IncomingEventBridgeEvent,
} from '../../../event-store/EventStoreEventBuilder'
import { EventStoreEventName } from '../../../event-store/EventStoreEventName'
import { JobCreatedEvent } from '../../events/JobCreatedEvent'
import { IProcessStepWorkerService } from '../ProcessStepWorkerService/ProcessStepWorkerService'

export interface IProcessStepWorkerController {
  processSteps: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

const validEventsMap: EventClassMap = {
  [EventStoreEventName.JOB_CREATED_EVENT]: JobCreatedEvent,
}

/**
 *
 */
export class ProcessStepWorkerController implements IProcessStepWorkerController {
  /**
   *
   */
  constructor(private readonly processStepWorkerService: IProcessStepWorkerService) {}

  /**
   *
   */
  public async processSteps(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logCtx = 'ProcessStepWorkerController.processSteps'
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
      const createJobResult = await this.processStepSafe(record)
      if (Result.isFailureTransient(createJobResult)) {
        sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
      }
    }

    console.info(`${logCtx} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   *
   */
  private async processStepSafe(
    sqsRecord: SQSRecord,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ProcessStepWorkerController.processStepSafe'
    console.info(`${logCtx} init:`, { sqsRecord })

    const parseInputEventResult = this.parseInputEvent(sqsRecord)
    if (Result.isFailure(parseInputEventResult)) {
      console.error(`${logCtx} failure exit:`, { parseInputEventResult, sqsRecord })
      return parseInputEventResult
    }

    const unverifiedEvent = parseInputEventResult.value as IncomingEventBridgeEvent
    const incomingCreateJobEventResult = EventStoreEventBuilder.fromEventBridge(validEventsMap, unverifiedEvent)
    if (Result.isFailure(incomingCreateJobEventResult)) {
      console.error(`${logCtx} failure exit:`, { incomingCreateJobEventResult, unverifiedEvent })
      return incomingCreateJobEventResult
    }

    const incomingCreateJobEvent = incomingCreateJobEventResult.value
    if (incomingCreateJobEvent instanceof JobCreatedEvent === false) {
      const message = `Expected JobCreatedEvent but got ${incomingCreateJobEvent}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingCreateJobEvent })
      return failure
    }

    const createJobResult = await this.processStepWorkerService.processStep(incomingCreateJobEvent)
    Result.isFailure(createJobResult)
      ? console.error(`${logCtx} exit failure:`, { createJobResult, incomingCreateJobEvent })
      : console.info(`${logCtx} exit success:`, { createJobResult, incomingCreateJobEvent })

    return createJobResult
  }

  /**
   *
   */
  private parseInputEvent(sqsRecord: SQSRecord): Success<unknown> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ProcessStepWorkerController.parseInputEvent'

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
