import "reflect-metadata";
import { createConnection } from "../../utils/database";
import { Portfolio } from "../../../orm/entity/Portfolio";
import { Application } from "../../../orm/entity/Application";
import { IEnvironment, IEnvironmentCreate } from "../../../orm/entity/Environment";
import { EnvironmentRepository } from "../../repository/EnvironmentRepository";
import { APIGatewayProxyResult, Context } from "aws-lambda";
import { ApiSuccessResponse, SuccessStatusCode } from "../../utils/response";
import internalSchema = require("../../models/internalSchema.json");
import middy from "@middy/core";
import xssSanitizer from "../../portfolioDrafts/xssSanitizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import JSONErrorHandlerMiddleware from "middy-middleware-json-error-handler";
import cors from "@middy/http-cors";
import { ApiGatewayEventParsed } from "../../utils/eventHandlingTool";
import { CORS_CONFIGURATION } from "../../utils/corsConfig";
import { wrapSchema } from "../../utils/schemaWrapper";
import { errorHandlingMiddleware } from "../../utils/errorHandlingMiddleware";
import createError from "http-errors";
import { IpCheckerMiddleware } from "../../utils/ipLogging";
import { validateRequestShape } from "../../utils/shapeValidator";

/**
 * Submits the environment of an application
 *
 * @param event - The POST request from API Gateway
 */
export async function baseHandler(
  event: ApiGatewayEventParsed<IEnvironment>,
  context?: Context
): Promise<APIGatewayProxyResult> {
  const setupResult = validateRequestShape<IEnvironment>(event);
  const { portfolioId, applicationId } = setupResult.path;
  const environmentBody = setupResult.bodyObject;

  // set up database connection
  const connection = await createConnection();
  const insertedEnvironments: IEnvironmentCreate[] = [];

  try {
    // ensures both the portfolio and application exists
    await connection.getRepository(Portfolio).findOneOrFail({
      id: portfolioId,
    });
    const application = await connection.getRepository(Application).findOneOrFail({
      id: applicationId,
    });

    // get all environment names for application
    const environments = await connection
      .getCustomRepository(EnvironmentRepository)
      .getAllEnvironmentNames(application.id);

    // ensure the environment name is unique for the application
    // according to business rule 3.3
    for (const environment of environments) {
      if (environment.name === environmentBody.name) {
        throw createError(400, "Duplicate environment name in application", {
          errorName: "DuplicateEnvironmentName",
          environmentName: environmentBody.name,
        });
      }
    }

    const insertResult = await connection
      .getCustomRepository(EnvironmentRepository)
      .createEnvironment([{ ...environmentBody, application }]);

    for (const environment of insertResult.identifiers) {
      // the result from the insert method does not have the name property
      // and an additional query after the insert is done to provide the correct shape
      // to be returned to the client. This assumes that only one environment will be
      // added at the moment but can be updated to handle more than one environment
      const queryInsertedEnvironment = await connection.getCustomRepository(EnvironmentRepository).findOneOrFail({
        select: [
          "name",
          "id",
          "createdAt",
          "updatedAt",
          "archivedAt",
          "administrators",
          "contributors",
          "readOnlyOperators",
        ],
        where: { id: environment.id },
      });

      insertedEnvironments.push(queryInsertedEnvironment);
      console.log("Inserted Environment: " + JSON.stringify(queryInsertedEnvironment));
    }
  } finally {
    connection.close();
  }

  return new ApiSuccessResponse<Array<IEnvironmentCreate>>(insertedEnvironments, SuccessStatusCode.CREATED);
}

export const handler = middy(baseHandler)
  .use(IpCheckerMiddleware())
  .use(xssSanitizer())
  .use(jsonBodyParser())
  .use(validator({ inputSchema: wrapSchema(internalSchema.Environment) }))
  .use(errorHandlingMiddleware())
  .use(JSONErrorHandlerMiddleware())
  .use(cors(CORS_CONFIGURATION));
