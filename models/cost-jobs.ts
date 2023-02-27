import { CspResponse } from "../api/util/csp-request";
import { CostResponseByPortfolio } from "../api/client";
import { provisionRequestSchema } from "./provisioning-schemas";

export interface CostRequest {
  requestId: string;
  portfolioId: string;
  targetCspName: string;
  startDate: string;
  endDate: string;
}

export type CostResponse = CspResponse<CostRequest, CostResponseByPortfolio>;

export const costRequestSchema = {
  type: "object",
  required: ["requestId", "portfolioId", "targetCspName", "startDate", "endDate"],
  properties: {
    requestId: { type: "string" },
    portfolioId: { type: "string" },
    targetCspName: provisionRequestSchema.properties.targetCspName,
    startDate: { type: "string" },
    endDate: { type: "string" },
  },
};
