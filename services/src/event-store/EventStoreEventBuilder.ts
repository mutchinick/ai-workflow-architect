import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { Failure, Result, Success } from '../errors/Result'
import { EventStoreEvent, EventStoreEventConstructor } from './EventStoreEvent'
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
  [key in EventStoreEventName]?: EventStoreEventConstructor
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
  ): Success<EventStoreEvent> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'EventStoreEventBuilder.fromEventBridge'

    try {
      const eventDetail = incomingEvent.detail
      const unmarshalledEvent = unmarshall(eventDetail.dynamodb.NewImage) as EventStoreEvent
      const eventName = unmarshalledEvent.eventName
      const EventClass = eventClassMap[eventName as keyof EventClassMap] as EventStoreEventConstructor
      const eventResult = EventClass.reconstitute(
        unmarshalledEvent.eventData,
        unmarshalledEvent.idempotencyKey,
        unmarshalledEvent.createdAt,
      )

      if (Result.isFailure(eventResult)) {
        console.error(`${logCtx} exit failure:`, { eventResult, incomingEvent })
        return eventResult
      }

      console.info(`${logCtx} exit success:`, { eventResult, incomingEvent })
      return eventResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingEvent })
      return failure
    }
  }
}
