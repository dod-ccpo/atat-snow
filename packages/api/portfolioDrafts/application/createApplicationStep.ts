import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApplicationStep, ValidationMessage } from "../../models/ApplicationStep";
import { APPLICATION_STEP } from "../../models/PortfolioDraft";
import { dynamodbDocumentClient as client } from "../../utils/dynamodb";
import {
  DATABASE_ERROR,
  NO_SUCH_PORTFOLIO_DRAFT,
  PATH_PARAMETER_REQUIRED_BUT_MISSING,
  REQUEST_BODY_EMPTY,
  REQUEST_BODY_INVALID,
} from "../../utils/errors";
import { ApiSuccessResponse, SuccessStatusCode } from "../../utils/response";
import { isApplication, isApplicationStep, isEnvironment, isValidJson, isValidUuidV4 } from "../../utils/validation";
export interface ApplicationValidationError {
  applicationName: string;
  invalidParameterName: string;
  invalidParameterValue: string;
  validationMessage: ValidationMessage;
}

/**
 * Submits the Application Step of the Portfolio Draft Wizard
 *
 * @param event - The POST request from API Gateway
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const portfolioDraftId = event.pathParameters?.portfolioDraftId;
  if (!portfolioDraftId) {
    return PATH_PARAMETER_REQUIRED_BUT_MISSING;
  }
  if (!isValidUuidV4(portfolioDraftId)) {
    return NO_SUCH_PORTFOLIO_DRAFT;
  }
  if (!event.body) {
    return REQUEST_BODY_EMPTY;
  }
  if (!isValidJson(event.body)) {
    return REQUEST_BODY_INVALID;
  }
  const requestBody = JSON.parse(event.body);
  if (!isApplicationStep(requestBody)) {
    return REQUEST_BODY_INVALID;
  }
  const applicationStep: ApplicationStep = requestBody;
  // const errors: Array<ApplicationValidationError> = validateApplications(applicationStep);
  // if (errors.length) {
  //   return createValidationErrorResponse({ input_validation_errors: errors });
  // }

  //   // NOTE This is absolutely not want we want to do long term but I am just trying to meet the ACs as simply as possible
  //   const error = validate(applicationStep);
  //   if (error) {
  //     return new ErrorResponse({ code: error.code, message: error.message }, ErrorStatusCode.BAD_REQUEST);
  //   }

  try {
    await client.send(
      new UpdateCommand({
        TableName: process.env.ATAT_TABLE_NAME ?? "",
        Key: {
          id: portfolioDraftId,
        },
        UpdateExpression: "set #portfolioVariable = :application, updated_at = :now",
        ExpressionAttributeNames: {
          "#portfolioVariable": APPLICATION_STEP,
        },
        ExpressionAttributeValues: {
          ":application": applicationStep,
          ":now": new Date().toISOString(),
        },
        ConditionExpression: "attribute_exists(created_at)",
        ReturnValues: "ALL_NEW",
      })
    );
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return NO_SUCH_PORTFOLIO_DRAFT;
    }
    console.error("Database error: " + error);
    return DATABASE_ERROR;
  }
  return new ApiSuccessResponse<ApplicationStep>(applicationStep, SuccessStatusCode.CREATED);
}

/**
 * Accepts an Application Step and performs input validation
 * on all Applications contained therein.
 * @returns a collection of application validation errors
 */
export function validateApplicationStepApplications(step: ApplicationStep): Array<ApplicationValidationError> {
  return step.applications
    .map(validateApplication)
    .reduce((accumulator, validationErrors) => accumulator.concat(validationErrors), []);
}

/**
 * Validates the given Application object
 * @param application an object that looks like an Application
 * @returns a collection of application validation errors
 */
export function validateApplication(application: unknown): Array<ApplicationValidationError> {
  if (!isApplication(application)) {
    throw Error("Input must be an Application object");
  }
  const errors = Array<ApplicationValidationError>();
  if (application.name.length < 4 || application.name.length > 100) {
    errors.push({
      applicationName: application.name,
      invalidParameterName: "name",
      invalidParameterValue: application.name,
      validationMessage: ValidationMessage.INVALID_APPLICATION_NAME,
    });
  }
  const environmentErrors = application.environments
    .map(validateEnvironment)
    .reduce((accumulator, validationErrors) => accumulator.concat(validationErrors), []);

  return errors.concat(environmentErrors);
}

export function validateEnvironment(environment: unknown): Array<ApplicationValidationError> {
  if (!isEnvironment(environment)) {
    throw Error("Input must be an Environment object");
  }
  const errors = Array<ApplicationValidationError>();
  if (environment.name.length < 4 || environment.name.length > 100) {
    errors.push({
      applicationName: environment.name,
      invalidParameterName: "name",
      invalidParameterValue: environment.name,
      validationMessage: ValidationMessage.INVALID_ENVIRONMENT_NAME,
    });
  }
  return errors;
}
