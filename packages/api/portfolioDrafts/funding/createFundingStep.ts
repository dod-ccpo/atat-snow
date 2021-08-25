import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FundingStep } from "../../models/FundingStep";
import {
  DATABASE_ERROR,
  NO_SUCH_PORTFOLIO_DRAFT,
  REQUEST_BODY_EMPTY,
  REQUEST_BODY_INVALID,
  PATH_VARIABLE_REQUIRED_BUT_MISSING,
} from "../../utils/errors";
import { ApiSuccessResponse, SuccessStatusCode, ValidationErrorResponse } from "../../utils/response";
import { isFundingStep, isValidJson, isValidDate, isPathParameterPresent } from "../../utils/validation";
import { ErrorCodes } from "../../models/Error";

/**
 * Submits the Funding Step of the Portfolio Draft Wizard
 *
 * @param event - The POST request from API Gateway
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return REQUEST_BODY_EMPTY;
  }

  // 1 b. The route must accept a {portfolioDraftId} that corresponds to a portfolio. This allows data for a specific portfolio draft’s funding to be stored
  const portfolioDraftId = event.pathParameters?.portfolioDraftId;
  if (!isPathParameterPresent(portfolioDraftId)) {
    return PATH_VARIABLE_REQUIRED_BUT_MISSING;
  }

  // 3. When an invalid {portfolioDraftId} is provided, a 404 code is provided, along with the message “Portfolio Draft with the given ID does not exist”
  if (!portfolioDraftId) {
    return NO_SUCH_PORTFOLIO_DRAFT;
  }

  // 1 c. The request body must be valid JSON
  if (!isValidJson(event.body)) {
    return REQUEST_BODY_INVALID;
  }
  const requestBody = JSON.parse(event.body);

  // 2. When a valid {portfolioDraftId} is provided, and the data in the request body is invalid, a 400 code is provided, along with the message “Invalid input“
  if (!isFundingStep(requestBody)) {
    return REQUEST_BODY_INVALID;
  }
  const fundingStep: FundingStep = requestBody;

  // TODO:
  // 1 d. Input validation must take place
  //   v. CLIN value and obligated funds must be numbers
  //   vi. CLIN value and obligated funds should be formatted as currency (i.e. “0.00”)

  // 2 b. An error map must be returned

  const clins = fundingStep.clins.values();
  // All validation tests below are logically negating the expected state; i.e. if (!expected) { return validation error }
  // Assertion messages are positive and describe the expected state.
  for (const clin of clins) {
    console.debug("Processing clin_number: " + clin.clin_number + "...");
    // 1 d. i. Any dates must be ISO 8601 compliant
    if (!isValidDate(clin.pop_start_date)) {
      console.warn("clin [" + clin.clin_number + "] - PoP start date must be a valid date");
      return createValidationErrorResponse({ pop_start_date: clin.pop_start_date });
    }
    if (!isValidDate(clin.pop_end_date)) {
      console.warn("clin [" + clin.clin_number + "] - PoP end date must be a valid date");
      return createValidationErrorResponse({ pop_end_date: clin.pop_end_date });
    }
    // 1 d. ii. PoP start date must occur before the PoP end date, and PoP end date cannot be in the past
    if (!(new Date(clin.pop_start_date) < new Date(clin.pop_end_date))) {
      console.warn("clin [" + clin.clin_number + "] - PoP start date must be before PoP end date");
      return createValidationErrorResponse({ pop_start_date: clin.pop_start_date, pop_end_date: clin.pop_end_date });
    }
    if (!(new Date() < new Date(clin.pop_end_date))) {
      console.warn("clin [" + clin.clin_number + "] - PoP end date must be in the future");
      return createValidationErrorResponse({ pop_end_date: clin.pop_end_date });
    }
    // 1 d. iii. Obligated funds must be greater than $0.00, and less than the total CLIN value
    if (!(clin.obligated_funds > 0)) {
      console.warn("clin [" + clin.clin_number + "] - Obligated funds must be greater than $0.00");
      return createValidationErrorResponse({ obligated_funds: clin.obligated_funds });
    }
    if (!(clin.obligated_funds < clin.total_clin_value)) {
      console.warn("clin [" + clin.clin_number + "] - Obligated funds must be less than the total CLIN value");
      return createValidationErrorResponse({ obligated_funds: clin.obligated_funds });
    }
    // 1 d. iv. Total CLIN value must be greater than $0.00
    if (!(clin.total_clin_value > 0)) {
      console.warn("clin [" + clin.clin_number + "] - Total CLIN value must be greater than $0.00");
      return createValidationErrorResponse({ total_clin_value: clin.total_clin_value });
    }
  }

  try {
    await updateFundingStepOfPortfolioDraft(portfolioDraftId, fundingStep);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return NO_SUCH_PORTFOLIO_DRAFT;
    }
    console.error("Database error: " + error);
    return DATABASE_ERROR;
  }
  return new ApiSuccessResponse<FundingStep>(fundingStep, SuccessStatusCode.CREATED);
}

/**
 * Returns an error response containing 1) an error map containing the specified invalid properties, 2) an error code, 3) a message
 * @param invalidProperties object containing property names and their values which failed validation
 * @returns ValidationErrorResponse containing an error map, error code, and a message
 */
export function createValidationErrorResponse(invalidProperties: Record<string, unknown>): ValidationErrorResponse {
  if (Object.keys(invalidProperties).length === 0) {
    throw Error("Parameter 'invalidProperties' must not be empty");
  }
  Object.keys(invalidProperties).forEach((key) => {
    if (!key) throw Error("Parameter 'invalidProperties' must not have empty string as key");
  });
  return new ValidationErrorResponse({
    errorMap: invalidProperties,
    code: ErrorCodes.INVALID_INPUT,
    message: "Invalid input",
  });
}

/**
 * Updates the Funding Step of the specified Portfolio Draft.
 * Creates a DynamoDB Update command object using the given input, executes it, and returns the promised output.
 * @param portfolioDraftId uuid identifier for a Portfolio Draft
 * @param step an object that looks like a Funding Step
 * @returns output from the Update command
 */
// TODO: consider making generic and sharing for update of three Step types
// Will require: 1) relocate, 2) allow additional Step model types, 3) derive stepKey from type, 4) some renaming
export async function updateFundingStepOfPortfolioDraft(
  portfolioDraftId: string,
  step: FundingStep
): Promise<UpdateCommandOutput> {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const result = await client.send(
    new UpdateCommand({
      TableName: process.env.ATAT_TABLE_NAME ?? "",
      Key: {
        id: portfolioDraftId,
      },
      UpdateExpression: "set #stepKey = :stepValue, #updateAtKey = :updateAtValue",
      ExpressionAttributeNames: {
        // values are JSON keys
        "#stepKey": "funding_step",
        "#updateAtKey": "updated_at",
      },
      ExpressionAttributeValues: {
        ":stepValue": step,
        ":updateAtValue": new Date().toISOString(),
      },
      ConditionExpression: "attribute_exists(created_at)",
      ReturnValues: "ALL_NEW",
    })
  );
  return result;
}
