import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { EventStoreEventDefinition } from './EventStoreEventDefinition'
import { EventStoreEventName } from './EventStoreEventName'
import { WorkflowAgentsDeployedEventDefinition } from './WorkflowAgentsDeployedEvent'
import { WorkflowContinuedEventDefinition } from './WorkflowContinuedEvent'
import { WorkflowCreatedEventDefinition } from './WorkflowCreatedEvent'
import { WorkflowPromptCompletedEventDefinition } from './WorkflowPromptCompletedEvent'
import { WorkflowPromptEnhancedEventDefinition } from './WorkflowPromptEnhancedEvent'
import { WorkflowStartedEventDefinition } from './WorkflowStartedEvent'
import { Failure, Result, Success } from './errors/Result'

/**
 *
 */
type EventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

export type IncomingEventBridgeEvent = EventBridgeEvent<string, EventDetail>

/**
 *
 */
const eventDefinitions = {
  [EventStoreEventName.WORKFLOW_STARTED]: WorkflowStartedEventDefinition,
  [EventStoreEventName.WORKFLOW_CONTINUED]: WorkflowContinuedEventDefinition,
  [EventStoreEventName.WORKFLOW_CREATED]: WorkflowCreatedEventDefinition,
  [EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED]: WorkflowAgentsDeployedEventDefinition,
  [EventStoreEventName.WORKFLOW_PROMPT_ENHANCED]: WorkflowPromptEnhancedEventDefinition,
  [EventStoreEventName.WORKFLOW_PROMPT_COMPLETED]: WorkflowPromptCompletedEventDefinition,
}

type DataType<T> = T extends EventStoreEventDefinition<infer D> ? D : never

export type EventDataMap = {
  [K in EventStoreEventName]: DataType<(typeof eventDefinitions)[K]>
}

/**
 *
 */
export class EventStoreEvent<TEventName extends EventStoreEventName> {
  public readonly idempotencyKey: string
  public readonly eventName: TEventName
  public readonly eventData: EventDataMap[TEventName]
  public readonly createdAt: string

  /**
   *
   */
  private constructor(idempotencyKey: string, eventName: TEventName, validatedData: EventDataMap[TEventName]) {
    this.idempotencyKey = idempotencyKey
    this.eventName = eventName
    this.eventData = validatedData
    this.createdAt = new Date().toISOString()
  }

  /**
   *
   */
  public static fromData<T extends EventStoreEventName>(
    eventName: T,
    eventData: EventDataMap[T],
  ): Success<EventStoreEvent<T>> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'EventStoreEvent.fromData'

    try {
      const definition = eventDefinitions[eventName]
      const validatedData = definition.parseValidate(eventData) as EventDataMap[T]
      const idempotencyKey = definition.generateIdempotencyKey(validatedData as never)
      const event = new EventStoreEvent(idempotencyKey, eventName, validatedData)
      const eventResult = Result.makeSuccess(event)
      console.info(`${logCtx} exit success:`, { eventResult, eventName, eventData })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, eventName, eventData })
      return failure
    }
  }

  /**
   *
   */
  public static fromEventBridge<T extends EventStoreEventName>(
    incomingEvent: IncomingEventBridgeEvent,
  ): Success<EventStoreEvent<T>> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'EventStoreEvent.fromEventBridge'

    try {
      const eventDetail = incomingEvent.detail
      const incomingEventPayload = unmarshall(eventDetail.dynamodb.NewImage) as EventStoreEvent<T>
      const eventName = incomingEventPayload.eventName
      const definition = eventDefinitions[eventName]
      const validatedData = definition.parseValidate(incomingEventPayload.eventData) as EventDataMap[T]
      const idempotencyKey = definition.generateIdempotencyKey(validatedData as never)
      const event = new EventStoreEvent(idempotencyKey, eventName, validatedData)
      const eventResult = Result.makeSuccess(event)
      console.info(`${logCtx} exit success:`, { eventResult, incomingEvent })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingEvent })
      return failure
    }
  }

  /**
   *
   */
  public static isOfType<T extends EventStoreEventName>(
    event: EventStoreEvent<T>,
    eventName: T,
  ): this is EventStoreEvent<T> {
    return event.eventName === eventName
  }
}
