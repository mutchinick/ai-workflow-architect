import { FailureKind } from './FailureKind'
import { Failure, Result, Success } from './Result'

describe(`Test Events Result`, () => {
  /***
   * Test Result.makeSuccess
   */
  describe(`Test Result.makeSuccess`, () => {
    it(`returns a void Success when called with no arguments`, () => {
      const result = Result.makeSuccess()
      const expectedResult: Success<void> = { value: undefined }
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns a Success with the expected value when called with a value`, () => {
      const mockValue = 'mockValue'
      const result = Result.makeSuccess(mockValue)
      const expectedResult: Success<string> = { value: mockValue }
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /***
   * Test Result.makeFailure
   */
  describe(`Test Result.makeFailure`, () => {
    it(`returns a non-transient Failure with the expected FailureKind and Error`, () => {
      const error = new Error('mockError')
      const failureKind: FailureKind = 'UnrecognizedError'
      const transient = false
      const result = Result.makeFailure(failureKind, error, transient)
      const expectedResult: Failure<typeof failureKind> = { failureKind, error, transient }
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns a transient Failure with the expected FailureKind and Error when an
        error is provided`, () => {
      const error = new Error('mockError')
      const failureKind: FailureKind = 'InvalidArgumentsError'
      const transient = true
      const result = Result.makeFailure(failureKind, error, transient)
      const expectedResult: Failure<typeof failureKind> = { failureKind, error, transient }
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns a Failure with an Error with the expected error message when an error
        message is provided`, () => {
      const expectedErrorMessage = 'mockErrorMessage'
      const error = new Error(expectedErrorMessage)
      const failureKind: FailureKind = 'InvalidArgumentsError'
      const result = Result.makeFailure(failureKind, error, true)
      expect(result.error instanceof Error).toBe(true)
      expect(result.error.message).toStrictEqual(expectedErrorMessage)
    })

    it(`returns a Failure with an Error with an "Unrecognized Error" message when the
        error parameter is not a string`, () => {
      const errorParameter = null as unknown
      const expectedErrorMessage = '[UnrecognizedError]: Unrecognized error'
      const failureKind: FailureKind = 'UnrecognizedError'
      const result = Result.makeFailure(failureKind, errorParameter, false)
      expect(result.error instanceof Error).toBe(true)
      expect(result.error.message).toStrictEqual(expectedErrorMessage)
    })
  })

  /***
   * Test Result.isSuccess
   */
  describe(`Test Result.isSuccess`, () => {
    it(`returns true if the Result is a Success with a value`, () => {
      const mockValue = 'mockValue'
      const result = Result.makeSuccess(mockValue)
      expect(Result.isSuccess(result)).toBe(true)
    })

    it(`returns true if the Result is a void Success`, () => {
      const result = Result.makeSuccess()
      expect(Result.isSuccess(result)).toBe(true)
    })

    it(`returns false if the Result is a Failure`, () => {
      const result = Result.makeFailure('UnrecognizedError', 'Mock message', false)
      expect(Result.isSuccess(result)).toBe(false)
    })
  })

  /***
   * Test Result.isFailure
   */
  describe(`Test Result.isFailure`, () => {
    it(`returns true if the Result is a Failure`, () => {
      const result = Result.makeFailure('UnrecognizedError', 'Mock message', false)
      expect(Result.isFailure(result)).toBe(true)
    })

    it(`returns false if the Result is a Success`, () => {
      const mockValue = 'mockValue'
      const result = Result.makeSuccess(mockValue)
      expect(Result.isFailure(result)).toBe(false)
    })
  })

  /***
   * Test Result.isFailureOfKind
   */
  describe(`Test Result.isFailureOfKind`, () => {
    it(`returns true if the Result is a Failure of type FailureKind`, () => {
      const failureKind: FailureKind = 'InvalidArgumentsError'
      const result = Result.makeFailure(failureKind, 'Mock message', false)
      expect(Result.isFailureOfKind(result, failureKind)).toBe(true)
    })

    it(`returns false if the Result is a Failure not of type FailureKind`, () => {
      const failureKind: FailureKind = 'InvalidArgumentsError'
      const result = Result.makeFailure(failureKind, 'Mock message', false)
      expect(Result.isFailureOfKind(result, 'UnrecognizedError' as never)).toBe(false)
    })

    it(`returns false if the Result is a Success`, () => {
      const mockValue = 'mockValue'
      const result = Result.makeSuccess(mockValue)
      expect(Result.isFailureOfKind(result, 'UnrecognizedError' as never)).toBe(false)
    })
  })

  /***
   * Test Result.isFailureTransient
   */
  describe(`Test Result.isFailureTransient`, () => {
    it(`returns true if the Result is a transient Failure`, () => {
      const transient = true
      const result = Result.makeFailure('InvalidArgumentsError', 'Mock message', transient)
      expect(Result.isFailureTransient(result)).toBe(true)
    })

    it(`returns false if the Result is a non-transient Failure`, () => {
      const transient = false
      const result = Result.makeFailure('InvalidArgumentsError', 'Mock message', transient)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns false if the Result is a Success`, () => {
      const mockValue = 'mockValue'
      const result = Result.makeSuccess(mockValue)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /***
   * Test Result.getSuccessValueOrThrow
   */
  describe(`Test Result.getSuccessValueOrThrow`, () => {
    it(`returns the expected value if the Result is a Success`, () => {
      const value = 'mockValue'
      const result = Result.makeSuccess(value)
      const expectedValue = Result.getSuccessValueOrThrow(result)
      expect(value).toStrictEqual(expectedValue)
    })

    it(`throws an Error if the Result is not a Success`, () => {
      const result = Result.makeFailure('UnrecognizedError', 'Mock message', false)
      expect(() => Result.getSuccessValueOrThrow(result)).toThrow()
    })
  })
})
