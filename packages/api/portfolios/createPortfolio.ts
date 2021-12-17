import "reflect-metadata";
import cors from "@middy/http-cors";
import jsonBodyParser from "@middy/http-json-body-parser";
import JSONErrorHandlerMiddleware from "middy-middleware-json-error-handler";
import middy from "@middy/core";
import validator from "@middy/validator";
import xssSanitizer from "../portfolioDrafts/xssSanitizer";
import { ApiGatewayEventParsed } from "../utils/eventHandlingTool";
import { APIGatewayProxyResult, Context } from "aws-lambda";
import { ApiSuccessResponse, SuccessStatusCode } from "../utils/response";
import { CORS_CONFIGURATION } from "../utils/corsConfig";
import { createConnection } from "../utils/database";
import { errorHandlingMiddleware } from "../utils/errorHandlingMiddleware";
import { IpCheckerMiddleware } from "../utils/ipLogging";
import { IPortfolio, IPortfolioCreate } from "../../orm/entity/Portfolio";
import { PortfolioRepository } from "../repository/PortfolioRepository";
import { validateRequestShape } from "../utils/shapeValidator";
import { wrapSchema } from "../utils/schemaWrapper";
import schema = require("../models/internalSchema.json");

/**
 * Creates a new Portfolio
 * A new portfolioId will be generated by the database.
 *
 * @param event - The POST request from API Gateway
 */
export async function baseHandler(
  event: ApiGatewayEventParsed<IPortfolio>,
  context?: Context
): Promise<APIGatewayProxyResult> {
  const setupResult = validateRequestShape<IPortfolio>(event);
  const portfolioBody = setupResult.bodyObject;

  // set up database connection
  const connection = await createConnection();
  const portfolioRepository = connection.getCustomRepository(PortfolioRepository);
  let insertedPortfolio: IPortfolioCreate;

  try {
    const insertResult = await portfolioRepository.createPortfolio(portfolioBody);
    const portfolioId = insertResult.identifiers[0].id;
    // query for the newly inserted portfolio
    insertedPortfolio = await portfolioRepository.findOneOrFail({
      select: [
        "id",
        "name",
        "csp",
        "description",
        "dodComponents",
        "owner",
        "portfolioManagers",
        "createdAt",
        "updatedAt",
        "archivedAt",
        "administrators",
        "provisioningStatus",
      ],
      where: { id: portfolioId },
    });

    console.log("Inserted Portfolio: " + JSON.stringify(insertedPortfolio));
  } finally {
    connection.close();
  }

  return new ApiSuccessResponse<IPortfolioCreate>(insertedPortfolio, SuccessStatusCode.CREATED);
}

const portfolioSchema = {
  additionalProperties: schema.Portfolio.additionalProperties,
  type: schema.Portfolio.type,
  required: schema.Portfolio.required,
  properties: {
    ...schema.PortfolioBase.properties,
    ...schema.Portfolio.properties,
    ...schema.PortfolioSummary.properties,
    ...schema.PortfolioAccess.properties,
  },
};

export const handler = middy(baseHandler)
  .use(IpCheckerMiddleware())
  .use(xssSanitizer())
  .use(jsonBodyParser())
  .use(validator({ inputSchema: wrapSchema(portfolioSchema) }))
  .use(errorHandlingMiddleware())
  .use(JSONErrorHandlerMiddleware())
  .use(cors(CORS_CONFIGURATION));
