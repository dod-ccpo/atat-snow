import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  mockApplicationStep,
  mockApplicationStepsBadData,
  mockPortfolioDraftSummary,
  mockBadPortfolioDraftSummary,
  mockApplicationsMissingFields,
  mockBadOperatorEmails,
} from "./commonMockData";
import { mockClient } from "aws-sdk-client-mock";
import { v4 as uuidv4 } from "uuid";
import { ValidationMessage } from "../../models/ApplicationStep";
import { Application } from "../../models/Application";
import {
  ApiSuccessResponse,
  ErrorStatusCode,
  OtherErrorResponse,
  SuccessStatusCode,
  ValidationErrorResponse,
} from "../../utils/response";
import {
  createValidationErrorResponse,
  handler,
  performDataValidationOnApplication,
  performDataValidationOnEnvironment,
  performDataValidationOnOperator,
} from "./createApplicationStep";
import {
  DATABASE_ERROR,
  NO_SUCH_PORTFOLIO_DRAFT,
  PATH_PARAMETER_REQUIRED_BUT_MISSING,
  REQUEST_BODY_EMPTY,
  REQUEST_BODY_INVALID,
} from "../../utils/errors";
import { AccessLevel } from "../../models/AccessLevel";

const ddbMock = mockClient(DynamoDBDocumentClient);
beforeEach(() => {
  ddbMock.reset();
});

const validRequest: APIGatewayProxyEvent = {
  body: JSON.stringify(mockApplicationStep),
  pathParameters: { portfolioDraftId: uuidv4() },
} as any;

describe("Handle service level error", function () {
  it("should return generic Error if exception caught", async () => {
    jest.spyOn(console, "error").mockImplementation(() => jest.fn()); // suppress output
    ddbMock.on(UpdateCommand).rejects("Some error occurred");
    const result = await handler(validRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(DATABASE_ERROR);
    expect(result.statusCode).toEqual(ErrorStatusCode.INTERNAL_SERVER_ERROR);
  });
});

describe("Path parameter tests", function () {
  it("should require path param", async () => {
    const emptyRequest: APIGatewayProxyEvent = {} as any; // no pathParameters
    const result = await handler(emptyRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(PATH_PARAMETER_REQUIRED_BUT_MISSING);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
  });
  it("should return error when path param not UUIDv4 (to avoid attempting update)", async () => {
    const invalidRequest: APIGatewayProxyEvent = {
      pathParameters: { portfolioDraftId: "invalid" }, // not UUIDv4
    } as any;
    const result = await handler(invalidRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(NO_SUCH_PORTFOLIO_DRAFT);
    expect(result.statusCode).toEqual(ErrorStatusCode.NOT_FOUND);
    expect(JSON.parse(result.body).message).toMatch(/Portfolio Draft with the given ID does not exist/);
  });
});

describe("Request body tests", function () {
  it("should return error when request body is empty", async () => {
    const emptyRequest: APIGatewayProxyEvent = {
      body: "", // empty body
      pathParameters: { portfolioDraftId: uuidv4() },
    } as any;
    const result = await handler(emptyRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(REQUEST_BODY_EMPTY);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
    expect(JSON.parse(result.body).message).toMatch(/Request body must not be empty/);
  });
  it("should return error when request body is invalid json", async () => {
    const invalidBodyRequest: APIGatewayProxyEvent = {
      body: JSON.stringify({ foo: "bar" }) + "}", // invalid json
      pathParameters: { portfolioDraftId: uuidv4() },
    } as any;
    const result = await handler(invalidBodyRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(REQUEST_BODY_INVALID);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
    expect(JSON.parse(result.body).message).toMatch(/A valid request body must be provided/);
  });
  it("should return error when request body is not a application step", async () => {
    const notApplicationStepRequest: APIGatewayProxyEvent = {
      body: JSON.stringify({ foo: "bar" }), // valid json, but not ApplicationStep
      pathParameters: { portfolioDraftId: uuidv4() },
    } as any;
    const result = await handler(notApplicationStepRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(REQUEST_BODY_INVALID);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
    expect(JSON.parse(result.body).message).toMatch(/A valid request body must be provided/);
  });
  it("should return an error when incorrect application shape found", async () => {
    const invalidRequest: APIGatewayProxyEvent = {
      body: JSON.stringify({ applications: mockApplicationsMissingFields, operators: [] }),
      pathParameters: { portfolioDraftId: uuidv4() },
    } as any;
    const result = await handler(invalidRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(REQUEST_BODY_INVALID);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
    expect(JSON.parse(result.body).message).toMatch(/A valid request body must be provided/);
  });
  it("should return an error when incorrect environment shape found", async () => {
    const badEnvironmentInApplication = [
      {
        name: "Cloud City Evac Planner",
        description: "Some Application",
        environments: [
          {
            badName: "bad",
            noOperators: [],
          },
        ],
        operators: [],
      },
    ];
    const invalidRequest: APIGatewayProxyEvent = {
      body: JSON.stringify({ applications: badEnvironmentInApplication, operators: [] }),
      pathParameters: { portfolioDraftId: uuidv4() },
    } as any;
    const result = await handler(invalidRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(REQUEST_BODY_INVALID);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
    expect(JSON.parse(result.body).message).toMatch(/A valid request body must be provided/);
  });
  it("should return an error when incorrect operator shape found", async () => {
    const invalidRequest: APIGatewayProxyEvent = {
      body: JSON.stringify({
        applications: [],
        operators: [{ noName: "the dark side", noAcess: "take over the universe" }],
      }),
      pathParameters: { portfolioDraftId: uuidv4() },
    } as any;
    const result = await handler(invalidRequest);
    expect(result).toBeInstanceOf(OtherErrorResponse);
    expect(result).toEqual(REQUEST_BODY_INVALID);
    expect(result.statusCode).toEqual(ErrorStatusCode.BAD_REQUEST);
    expect(JSON.parse(result.body).message).toMatch(/A valid request body must be provided/);
  });
});

describe("Successful operation tests", function () {
  it("should return application step and http status code 201", async () => {
    const result = await handler(validRequest);
    expect(result).toBeInstanceOf(ApiSuccessResponse);
    expect(result.statusCode).toEqual(SuccessStatusCode.CREATED);
    expect(result.body).toStrictEqual(JSON.stringify(mockApplicationStep));
  });
  it("should have correct number of applications and environments", async () => {
    const mockResponseGoodPortfolioSummary = mockPortfolioDraftSummary;
    ddbMock.on(UpdateCommand).resolves({
      Attributes: mockResponseGoodPortfolioSummary,
    });
    const result = await handler(validRequest);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.applications.length).toBe(mockResponseGoodPortfolioSummary.num_applications);
    expect(responseBody.applications.flatMap((app: Application) => app.environments).length).toBe(
      mockResponseGoodPortfolioSummary.num_environments
    );
  });
});

describe("Incorrect number of applications and environments", function () {
  it("should have incorrect number of applications and environments false", async () => {
    const mockBadPortfolioSummary = mockBadPortfolioDraftSummary;
    ddbMock.on(UpdateCommand).resolves({
      Attributes: mockApplicationStepsBadData,
    });
    const result = await handler(validRequest);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.applications.length).not.toBe(mockBadPortfolioSummary.num_applications);
    expect(responseBody.applications.flatMap((app: Application) => app.environments).length).not.toBe(
      mockBadPortfolioSummary.num_environments
    );
  });
});

describe("Individual Application input validation tests", function () {
  it("should return no error map entries when given Application has good data", async () => {
    const allerrors = mockApplicationStep.applications
      .map(performDataValidationOnApplication)
      .reduce((accumulator, validationErrors) => accumulator.concat(validationErrors), []);
    expect(allerrors).toStrictEqual([]);
  });
  const tooShortName = "abc";
  const tooLongName =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eleifend lectus ut luctus ultricies nisi.";
  const tooLongDisplayName =
    "waaaaaaaaaaaaaaaaaaaaaaaaayyyyyy tooooooooooooooooooooooooooooooooooooo loooooooooonnnnnnnnnnngggggggggg";
  it("should return error map entries when an operator has a name that is too short", async () => {
    const operator = { display_name: "", email: "dark.1234-567890_@side.mil", access: AccessLevel.READ_ONLY };
    const errors = performDataValidationOnOperator(operator);
    expect(errors.length).toEqual(1);
    expect(errors).toContainEqual({
      operatorDisplayName: "",
      invalidParameterName: "display_name",
      invalidParameterValue: "",
      validationMessage: ValidationMessage.INVALID_OPERATOR_NAME,
    });
  });
  it.each(mockBadOperatorEmails)("should return an error map when incorrect operator email", async (operator) => {
    const errors = performDataValidationOnOperator(operator);
    expect(errors.length).toEqual(1);
    expect(errors[0].invalidParameterValue).toBe(operator.email);
  });
  it("should return error map entries when an operator has a name that is too long", async () => {
    const operator = { display_name: tooLongName, email: "dark@side123456789.MIL", access: AccessLevel.READ_ONLY };
    const errors = performDataValidationOnOperator(operator);
    expect(errors.length).toEqual(1);
    expect(errors).toContainEqual({
      operatorDisplayName: tooLongName,
      invalidParameterName: "display_name",
      invalidParameterValue: tooLongName,
      validationMessage: ValidationMessage.INVALID_OPERATOR_NAME,
    });
  });
  it("should return error map entries when given Application and Operator has a name that is too short", async () => {
    const appErrors = performDataValidationOnApplication(mockApplicationStepsBadData[0].applications[0]);
    const opErrors = performDataValidationOnOperator(mockApplicationStepsBadData[0].operators[0]);
    const errors = [...appErrors, ...opErrors];
    expect(errors.length).toEqual(2);
    expect(errors).toContainEqual({
      applicationName: tooShortName,
      invalidParameterName: "name",
      invalidParameterValue: tooShortName,
      validationMessage: ValidationMessage.INVALID_APPLICATION_NAME,
    });
  });
  it("should return error map entries when given Application and Operator has a name that is too long", async () => {
    const errors = performDataValidationOnApplication(mockApplicationStepsBadData[1].applications[0]);
    expect(errors.length).toEqual(2);
    expect(errors).toContainEqual({
      applicationName: tooLongName,
      invalidParameterName: "name",
      invalidParameterValue: tooLongName,
      validationMessage: ValidationMessage.INVALID_APPLICATION_NAME,
    });
    expect(errors).toContainEqual({
      operatorDisplayName: tooLongDisplayName,
      invalidParameterName: "display_name",
      invalidParameterValue: tooLongDisplayName,
      validationMessage: ValidationMessage.INVALID_OPERATOR_NAME,
    });
  });
  it("should return error map entries when given Application has an Environment and Operator with a name that is too short", async () => {
    const errors = performDataValidationOnEnvironment(mockApplicationStepsBadData[2].applications[0].environments[0]);
    expect(errors.length).toEqual(2);
    expect(errors).toContainEqual({
      environmentName: tooShortName,
      invalidParameterName: "name",
      invalidParameterValue: tooShortName,
      validationMessage: ValidationMessage.INVALID_ENVIRONMENT_NAME,
    });
    expect(errors).toContainEqual({
      operatorDisplayName: "",
      invalidParameterName: "display_name",
      invalidParameterValue: "",
      validationMessage: ValidationMessage.INVALID_OPERATOR_NAME,
    });
  });
  it("should return error map entries when given Application has an Environment and Operator with a name that is too long", async () => {
    const errors = performDataValidationOnEnvironment(mockApplicationStepsBadData[3].applications[0].environments[0]);
    expect(errors.length).toEqual(2);
    expect(errors).toContainEqual({
      environmentName: tooLongName,
      invalidParameterName: "name",
      invalidParameterValue: tooLongName,
      validationMessage: ValidationMessage.INVALID_ENVIRONMENT_NAME,
    });
    expect(errors).toContainEqual({
      operatorDisplayName: tooLongDisplayName,
      invalidParameterName: "display_name",
      invalidParameterValue: tooLongDisplayName,
      validationMessage: ValidationMessage.INVALID_OPERATOR_NAME,
    });
  });
});

describe("Error response creation tests", function () {
  it("should return error response that includes error_map in response body", async () => {
    const obj = { errors: { propertyA: "property_value", propertyB: "property_value" } };
    const invalidProperties: Record<string, unknown> = obj;
    const response = createValidationErrorResponse(invalidProperties);
    expect(response).toBeInstanceOf(ValidationErrorResponse);
    expect(JSON.parse(response.body).message).toMatch(/Invalid input/);
    expect(JSON.parse(response.body).error_map).toEqual(obj);
  });
  it.each(mockApplicationStepsBadData)(
    "should return error response containing all invalid properties in error_map",
    async (item) => {
      const validRequestBadData: APIGatewayProxyEvent = {
        body: JSON.stringify(item),
        pathParameters: { portfolioDraftId: uuidv4() },
      } as any;
      const result = await handler(validRequestBadData);
      expect(result).toBeInstanceOf(ValidationErrorResponse);
      expect(JSON.parse(result.body).message).toMatch(/Invalid input/);
      expect(JSON.parse(result.body).error_map).not.toBeUndefined();
    }
  );
  it("should throw error if invalid properties input is empty", async () => {
    const emptyInvalidProperties: Record<string, unknown> = {};
    expect(() => {
      createValidationErrorResponse(emptyInvalidProperties);
    }).toThrow(Error("Parameter 'invalidProperties' must not be empty"));
  });
  it("should throw error if invalid properties input has empty string as key", async () => {
    const emptyStringKeyInvalidProperties: Record<string, unknown> = {
      "": { propertyA: "property_value", propertyB: "property_value" },
    };
    expect(() => {
      createValidationErrorResponse(emptyStringKeyInvalidProperties);
    }).toThrow(Error("Parameter 'invalidProperties' must not have empty string as key"));
  });
});

describe("Portfolio Draft DNE tests", () => {
  it("should return error response when given portfolio draft does not exist", async () => {
    ddbMock.on(UpdateCommand).rejects({ name: "ConditionalCheckFailedException" });
    const result = await handler(validRequest);
    expect(result).toEqual(NO_SUCH_PORTFOLIO_DRAFT);
  });
});
