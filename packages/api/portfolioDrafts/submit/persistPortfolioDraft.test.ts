import { Context } from "aws-lambda";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { v4 as uuidv4 } from "uuid";
import { handler } from "./persistPortfolioDraft";
import { mockPortfolioDraft } from "../commonPortfolioDraftMockData";
import { ProvisioningStatus } from "../../models/ProvisioningStatus";
import { DATABASE_ERROR } from "../../utils/errors";

const ddbMock = mockClient(DynamoDBDocumentClient);
const consoleLogSpy = jest.spyOn(console, "log");
beforeEach(() => {
  ddbMock.reset();
  consoleLogSpy.mockReset();
});

describe("Persist CSP response handler", () => {
  const validatedGoodPortfolioDraft: any = {
    ...mockPortfolioDraft,
    submit_id: uuidv4(),
    status: ProvisioningStatus.IN_PROGRESS,
    validatedResult: "SUCCESS",
  };
  it("should return a portfolio draft with a status of complete", async () => {
    const updatedPortfolioDraft = { ...validatedGoodPortfolioDraft, status: ProvisioningStatus.COMPLETE };
    ddbMock.on(UpdateCommand).resolves(updatedPortfolioDraft);
    await handler(validatedGoodPortfolioDraft, {} as Context);
    expect(consoleLogSpy).toBeCalledTimes(2);
    expect(consoleLogSpy).toBeCalledWith(`DB UPDATE RESULT (successful): ${JSON.stringify(updatedPortfolioDraft)}`);
  });
});
