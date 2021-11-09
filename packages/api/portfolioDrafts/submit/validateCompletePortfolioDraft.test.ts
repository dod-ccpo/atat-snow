import { handler, ValidationResult } from "./validateCompletePortfolioDraft";
import { mockPortfolioDraft } from "../commonPortfolioDraftMockData";
import { v4 as uuidv4 } from "uuid";
import { APPLICATION_STEP, FUNDING_STEP, PORTFOLIO_STEP } from "../../models/PortfolioDraft";
import { ProvisioningStatus } from "../../models/ProvisioningStatus";
import { Context } from "aws-lambda";
import util from "util";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("validate portfolio draft submission", () => {
  it("should return the portfolio draft with successful validation", async () => {
    const consoleLogSpy = jest.spyOn(console, "log");
    const completedPortfolioDraft: any = {
      body: { ...mockPortfolioDraft, submit_id: uuidv4(), status: ProvisioningStatus.IN_PROGRESS },
    };
    const modifiedPortfolioDraft: any = {
      body: {
        portfolio_step: mockPortfolioDraft[PORTFOLIO_STEP],
        funding_step: mockPortfolioDraft[FUNDING_STEP],
        application_step: mockPortfolioDraft[APPLICATION_STEP],
        id: uuidv4(),
        submit_id: uuidv4(),
        status: ProvisioningStatus.IN_PROGRESS,
      },
    };

    const response = await handler(completedPortfolioDraft, {} as Context, () => null);
    // const response = await handler(modifiedPortfolioDraft, {} as Context, () => null);
    console.log("SUCCESS validation Response: " + util.inspect(response, false, null, true));
    expect(response?.validationResult).toEqual(ValidationResult.SUCCESS);
  });
  it("should return an error with validating the portfolio draft", async () => {
    const modifiedBadPortfolioDraft: any = {
      body: {
        portfolio_step: mockPortfolioDraft[PORTFOLIO_STEP],
        funding_step: mockPortfolioDraft[FUNDING_STEP],
        // application_step: mockPortfolioDraft[APPLICATION_STEP],
        id: uuidv4(),
        submit_id: uuidv4(),
        status: ProvisioningStatus.IN_PROGRESS,
      },
    };
    const response = await handler(modifiedBadPortfolioDraft, {} as Context, () => null);
    console.log("FAILED validation Response: " + util.inspect(response, false, null, true));
    console.log("EVENT: " + util.inspect(response, false, null, true));
    expect(response?.validationResult).toEqual(ValidationResult.FAILED);
  });
});
