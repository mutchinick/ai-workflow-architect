import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../shared/TypeUtils'
import { Result } from './errors/Result'
import { EventStoreClient } from './EventStoreClient'
import { EventStoreEvent } from './EventStoreEvent'
import { EventStoreEventName } from './EventStoreEventName'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = EventStoreEventName.WORKFLOW_STARTED
const mockWorkflowId = 'mockWorkflowId'

function buildMockEventStoreEvent(): TypeUtilsMutable<EventStoreEvent<typeof mockEventName>> {
  const mockClass = EventStoreEvent.fromData(mockEventName, {
    workflowId: mockWorkflowId,
    started: true,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockEventStoreEvent = buildMockEventStoreEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#${mockEventStoreEvent.eventName}`,
      sk: `EVENT#${mockEventStoreEvent.idempotencyKey}`,
      idempotencyKey: mockEventStoreEvent.idempotencyKey,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
      eventName: EventStoreEventName.WORKFLOW_STARTED,
      eventData: {
        workflowId: mockWorkflowId,
        started: true,
      },
      createdAt: mockDate,
      gsi1pk: `EVENTS#EVENT`,
      gsi1sk: `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Events EventStoreClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test EventStoreEvent edge cases
   ************************************************************/
  it(`does not return a Failure if the input EventStoreEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const result = await eventStoreClient.publish(mockEventStoreEvent)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventStoreEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const mockTestEvent = undefined as never
    const result = await eventStoreClient.publish(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventStoreEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const mockTestEvent = null as never
    const result = await eventStoreClient.publish(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventStoreEvent is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const mockTestEvent = { ...mockEventStoreEvent }
    const result = await eventStoreClient.publish(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test EventStoreEvent.eventData edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventStoreEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const mockTestEvent = buildMockEventStoreEvent()
    mockTestEvent.eventData = undefined as never
    const result = await eventStoreClient.publish(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      EventStoreEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const mockTestEvent = buildMockEventStoreEvent()
    mockTestEvent.eventData = null as never
    const result = await eventStoreClient.publish(mockTestEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    await eventStoreClient.publish(mockEventStoreEvent)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    await eventStoreClient.publish(mockEventStoreEvent)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`returns a transient Failure of kind UnrecognizedError if
      DynamoDBDocumentClient.send throws an unrecognized Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const result = await eventStoreClient.publish(mockEventStoreEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateEventRaisedError if
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const result = await eventStoreClient.publish(mockEventStoreEvent)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateEventError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected Success<void> if the execution path is successful`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const eventStoreClient = new EventStoreClient(mockDdbDocClient)
    const result = await eventStoreClient.publish(mockEventStoreEvent)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
