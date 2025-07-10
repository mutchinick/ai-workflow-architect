import { FailureKind } from '../errors/FailureKind'
import { Failure, Success } from '../errors/Result'
import { EventStoreEventData } from './EventStoreEventData'

/**
 *
 */
export abstract class EventStoreEvent {
  public readonly idempotencyKey: string
  public readonly eventName: string
  public readonly eventData: EventStoreEventData
  public readonly createdAt: string

  /**
   *
   */
  protected constructor(eventName: string, eventData: EventStoreEventData, idempotencyKey: string, createdAt: string) {
    this.idempotencyKey = idempotencyKey
    this.eventName = eventName
    this.eventData = eventData
    this.createdAt = createdAt
  }
}

/**
 *
 */
export interface EventStoreEventConstructor {
  fromData(eventData: EventStoreEventData): Success<EventStoreEvent> | Failure<FailureKind>

  reconstitute(
    eventData: EventStoreEventData,
    idempotencyKey: string,
    createdAt: string,
  ): Success<EventStoreEvent> | Failure<FailureKind>
}
