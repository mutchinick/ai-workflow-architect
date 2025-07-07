import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { FailureKind } from './errors/FailureKind'
import { Failure, Result, Success } from './errors/Result'
import { EventStoreEventBase } from './EventStoreEventBase'
import { EventStoreEventName } from './EventStoreEventName'

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

/**
 *
 */
export type IncomingEventBridgeEvent = EventBridgeEvent<string, EventDetail>

/**
 *
 */
export type EventClassMap = {
  [key in EventStoreEventName]?: EventStoreEventBase
}

/**
 *
 */
export class EventStoreEventBuilder {
  /**
   *
   */
  public static fromEventBridge(
    eventClassMap: EventClassMap,
    incomingEvent: IncomingEventBridgeEvent,
  ): Success<EventStoreEventBase> | Failure<FailureKind> {
    const logCtx = 'EventStoreEvent.fromEventBridge'

    try {
      const eventDetail = incomingEvent.detail
      const unmarshalledEvent = unmarshall(eventDetail.dynamodb.NewImage) as EventStoreEventBase
      const eventName = unmarshalledEvent.eventName
      const EventClass = eventClassMap[eventName as keyof EventClassMap] as EventStoreEventBase
      const eventResult = EventClass.fromData(unmarshalledEvent.eventData)
      console.info(`${logCtx} exit success:`, { eventResult, incomingEvent })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingEvent })
      return failure
    }
  }
}
