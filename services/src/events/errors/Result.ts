import { FailureKind } from './FailureKind'

export type Success<T> = {
  readonly value: T
}

export type Failure<K extends FailureKind> = {
  readonly failureKind: K
  readonly transient: boolean
  readonly error: Error
}

/**
 *
 */
export class Result {
  /**
   *
   */
  public static makeSuccess(): Success<void>
  /**
   *
   */
  public static makeSuccess<T>(value: T): Success<T>
  /**
   *
   */
  public static makeSuccess<T = void>(value?: T): Success<T> {
    return { value } as Success<T>
  }

  /**
   *
   */
  public static makeFailure<K extends FailureKind>(failureKind: K, err: unknown, transient: boolean): Failure<K> {
    let error: Error
    if (err instanceof Error) {
      error = err
    } else if (typeof err === 'string') {
      error = new Error(`[${failureKind}]: ${err}`)
    } else {
      error = new Error('[UnrecognizedError]: Unrecognized error')
    }
    return { failureKind, transient, error }
  }

  /**
   *
   */
  public static isSuccess<T, K extends FailureKind>(result: Success<T> | Failure<K>): result is Success<T> {
    return !this.isFailure(result)
  }

  /**
   *
   */
  public static isFailure<T, K extends FailureKind>(result: Success<T> | Failure<K>): result is Failure<K> {
    return result && typeof result === 'object' && 'error' in result
  }

  /**
   *
   */
  public static isFailureOfKind<T, K extends FailureKind, Kn extends K>(
    result: Success<T> | Failure<K>,
    failureKind: Kn,
  ): result is Failure<Kn> {
    return this.isFailure(result) && result.failureKind === failureKind
  }

  /**
   *
   */
  public static isFailureTransient<T, K extends FailureKind, Kn extends K>(
    result: Success<T> | Failure<K>,
  ): result is Failure<Kn> {
    return this.isFailure(result) && result.transient === true
  }

  /**
   *
   */
  public static getSuccessValueOrThrow<T, K extends FailureKind>(result: Success<T> | Failure<K>): T {
    if (this.isSuccess(result)) {
      return result.value
    }

    const error = new Error('Result could not be asserted to be a Success')
    throw error
  }
}
