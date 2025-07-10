import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Failure, Result, Success } from '../errors/Result'
import { EventStoreEvent } from './EventStoreEvent'

export interface IEventStoreClient {
  publish: (
    event: EventStoreEvent,
  ) => Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class EventStoreClient implements IEventStoreClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   *
   */
  public async publish(
    event: EventStoreEvent,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>
  > {
    const logContext = 'EventStoreClient.raiseSkuRestockedEvent'
    console.info(`${logContext} init:`)

    const inputValidationResult = this.validateInput(event)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logContext} exit failure:`, { inputValidationResult, event })
      return inputValidationResult
    }

    const buildCommandResult = this.buildDdbCommand(event)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logContext} exit failure:`, { buildCommandResult, event })
      return buildCommandResult
    }

    const ddbCommand = buildCommandResult.value
    const sendCommandResult = await this.sendDdbCommand(ddbCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logContext} exit failure:`, { sendCommandResult, event })
      : console.info(`${logContext} exit success:`, { sendCommandResult, event })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(event: EventStoreEvent): Success<void> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EventStoreClient.validateInput'

    if (event instanceof EventStoreEvent === false) {
      const message = `Expected EventStoreEvent but got ${event}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logContext} exit failure:`, { failure, event })
      return failure
    }

    if (event.eventData == null) {
      const message = `Expected EventStoreEvent.eventData but got ${event.eventData}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logContext} exit failure:`, { failure, event })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildDdbCommand(event: EventStoreEvent): Success<PutCommand> | Failure<'InvalidArgumentsError'> {
    const logContext = 'EventStoreClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but PutCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, idempotencyKey } = event

      const eventPk = `EVENTS#${eventName}`
      const eventSk = `EVENT#${idempotencyKey}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          idempotencyKey,
          eventName,
          eventData,
          createdAt,
          _tn: eventTn,
          _sn: eventSn,
          gsi1pk: eventGsi1pk,
          gsi1sk: eventGsi1sk,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return Result.makeSuccess(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, event })
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logContext} exit failure:`, { failure, event })
      return failure
    }
  }

  /**
   *
   */
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): Promise<Success<void> | Failure<'DuplicateEventError'> | Failure<'UnrecognizedError'>> {
    const logContext = 'EventStoreClient.sendDdbCommand'
    console.info(`${logContext} init:`)

    try {
      await this.ddbDocClient.send(ddbCommand)
      const sendCommandResult = Result.makeSuccess()
      console.info(`${logContext} exit success:`, { sendCommandResult, ddbCommand })
      return sendCommandResult
    } catch (error) {
      console.error(`${logContext} error caught:`, { error, ddbCommand })

      // If the error is a ConditionalCheckFailedException, it means the item already exists
      // and we can treat it as a duplicate event error.
      if (error instanceof ConditionalCheckFailedException) {
        const duplicationFailure = Result.makeFailure('DuplicateEventError', error, false)
        console.error(`${logContext} exit failure:`, { duplicationFailure, ddbCommand })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logContext} exit failure:`, { unrecognizedFailure, ddbCommand })
      return unrecognizedFailure
    }
  }
}
