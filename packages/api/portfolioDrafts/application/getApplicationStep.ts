import { GetCommand, GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApplicationStep } from "../../models/ApplicationStep";
import { dynamodbDocumentClient as client } from "../../utils/dynamodb";
import { ApiSuccessResponse, SuccessStatusCode } from "../../utils/response";
import { DATABASE_ERROR, NO_SUCH_PORTFOLIO_DRAFT, NO_SUCH_APPLICATION_STEP } from "../../utils/errors";

export async function getApplicationStep(portfolioDraftId: string): Promise<GetCommandOutput> {
  return client.send(
    new GetCommand({
      TableName: process.env.ATAT_TABLE_NAME ?? "",
      Key: {
        id: portfolioDraftId,
      },
      ProjectionExpression: "application_step",
    })
  );
}

/**
 * Gets the Application Step of the specified Portfolio Draft if it exists
 *
 * @param event - The GET request from API Gateway
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const portfolioDraftId = event.pathParameters?.portfolioDraftId;
  if (!portfolioDraftId) {
    return NO_SUCH_PORTFOLIO_DRAFT;
  }
  try {
    const data = await getApplicationStep(portfolioDraftId);
    if (!data.Item) {
      return NO_SUCH_PORTFOLIO_DRAFT;
    }
    if (!data.Item?.application_step) {
      return NO_SUCH_APPLICATION_STEP;
    }
    return new ApiSuccessResponse<ApplicationStep>(data.Item.application_step as ApplicationStep, SuccessStatusCode.OK);
  } catch (error) {
    console.error("Database error: " + error);
    return DATABASE_ERROR;
  }
}
