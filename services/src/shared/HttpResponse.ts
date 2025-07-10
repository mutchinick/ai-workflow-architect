import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'

/**
 *
 */
export class HttpResponse {
  /**
   *
   */
  public static OK(responseBody: object): APIGatewayProxyStructuredResultV2 {
    const response: APIGatewayProxyStructuredResultV2 = {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    }
    return response
  }

  /**
   *
   */
  public static Created(responseBody: object): APIGatewayProxyStructuredResultV2 {
    const response: APIGatewayProxyStructuredResultV2 = {
      statusCode: 201,
      body: JSON.stringify(responseBody),
    }
    return response
  }

  /**
   *
   */
  public static Accepted(responseBody: object): APIGatewayProxyStructuredResultV2 {
    const response: APIGatewayProxyStructuredResultV2 = {
      statusCode: 202,
      body: JSON.stringify(responseBody),
    }
    return response
  }

  /**
   *
   */
  public static InternalServerError(): APIGatewayProxyStructuredResultV2 {
    const response: APIGatewayProxyStructuredResultV2 = {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
    return response
  }

  /**
   *
   */
  public static BadRequestError(): APIGatewayProxyStructuredResultV2 {
    const response: APIGatewayProxyStructuredResultV2 = {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request' }),
    }
    return response
  }
}
