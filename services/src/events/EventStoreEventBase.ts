import { FailureKind } from './errors/FailureKind'
import { Failure, Success } from './errors/Result'

/**
 *
 */
export abstract class EventStoreEventBase {
  public readonly idempotencyKey: string
  public readonly eventName: string
  public readonly eventData: Record<string, unknown>
  public readonly createdAt: string

  /**
   *
   */
  protected constructor(
    eventName: string,
    eventData: Record<string, unknown>,
    idempotencyKey: string,
    createdAt: string,
  ) {
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
  fromData(data: Record<string, unknown>): Success<EventStoreEventBase> | Failure<FailureKind>

  reconstitute(
    data: Record<string, unknown>,
    idempotencyKey: string,
    createdAt: string,
  ): Success<EventStoreEventBase> | Failure<FailureKind>
}
