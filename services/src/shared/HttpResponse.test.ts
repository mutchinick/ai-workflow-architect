import { HttpResponse } from './HttpResponse'

const headers = {
  'Content-Type': 'application/json',
}

describe(`Shared HttpResponse tests`, () => {
  test(`HttpResponse.OK returns the expected 200 OK APIGatewayProxyStructuredResultV2
        response`, () => {
    const mockResponseBody = { mockItem1: 1, mockItem2: 'mockItem2' }
    const expectedResponse = {
      headers,
      statusCode: 200,
      body: JSON.stringify(mockResponseBody),
    }
    const response = HttpResponse.OK(mockResponseBody)
    expect(response).toStrictEqual(expectedResponse)
  })

  test(`HttpResponse.Created returns the expected 201 Created
        APIGatewayProxyStructuredResultV2 response`, () => {
    const mockResponseBody = { mockItem1: 1, mockItem2: 'mockItem2' }
    const expectedResponse = {
      headers,
      statusCode: 201,
      body: JSON.stringify(mockResponseBody),
    }
    const response = HttpResponse.Created(mockResponseBody)
    expect(response).toStrictEqual(expectedResponse)
  })

  test(`HttpResponse.Accepted returns the expected 202 Accepted
        APIGatewayProxyStructuredResultV2 response`, () => {
    const mockResponseBody = { mockItem1: 1, mockItem2: 'mockItem2' }
    const expectedResponse = {
      headers,
      statusCode: 202,
      body: JSON.stringify(mockResponseBody),
    }
    const response = HttpResponse.Accepted(mockResponseBody)
    expect(response).toStrictEqual(expectedResponse)
  })

  test(`HttpResponse.InternalServerError returns the expected 500 Internal Server Error
        APIGatewayProxyStructuredResultV2 response`, () => {
    const mockResponseBody = { message: 'Internal Server Error' }
    const expectedResponse = {
      headers,
      statusCode: 500,
      body: JSON.stringify(mockResponseBody),
    }
    const response = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  test(`HttpResponse.BadRequestError returns the expected 400 Bad Request
        APIGatewayProxyStructuredResultV2 response`, () => {
    const mockResponseBody = { message: 'Bad Request' }
    const expectedResponse = {
      headers,
      statusCode: 400,
      body: JSON.stringify(mockResponseBody),
    }
    const response = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })
})
