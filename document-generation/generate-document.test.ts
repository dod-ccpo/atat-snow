import fs from "fs";
import { Context } from "aws-lambda";
import { DocumentType } from "../models/document-generation";
import {
  ApiBase64SuccessResponse,
  SuccessBase64Response,
  SuccessStatusCode,
  ValidationErrorResponse,
} from "../utils/response";
import { handler } from "./generate-document";
import { requestContext } from "../api/util/common-test-fixtures";
import {
  sampleDowRequest,
  sampleIfpRequest,
  sampleIgceRequest,
  sampleRequirementsChecklistRequest,
  sampleJustificationAndApproval,
  sampleMarketResearchReport,
} from "./utils/sampleTestData";

const validRequest = {
  body: JSON.stringify(sampleDowRequest),
  headers: {
    "Content-Type": "application/json",
  },
  requestContext,
} as any;

const docHeaders = {
  igce: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename=IndependentGovernmentCostEstimate.xlsx`,
  },
  dow: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=DescriptionOfWork.docx`,
  },
  ifp: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=IncrementalFundingPlan.docx`,
  },
  requirementsChecklist: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=RequirementsChecklist.docx`,
  },
  janda: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=JustificationAndApproval.docx`,
  },
  mrr: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=MarketResearchReport.docx`,
  },
};

jest.setTimeout(15000); // default of 5000 was too short
// mocking the functions that generate the documents
jest.mock("./chromium", () => {
  return {
    generateDocument: jest.fn().mockImplementation(() => Buffer.from("generateDocument")),
  };
});
jest.mock("./igce-document", () => {
  return {
    generateIGCEDocument: jest.fn().mockImplementation(() => {
      const buffer = Buffer.from("generateIGCEDocument");
      return new ApiBase64SuccessResponse(buffer.toString("base64"), SuccessStatusCode.OK, docHeaders.igce);
    }),
  };
});
jest.mock("./dow-document", () => {
  return {
    generateDowDocument: jest.fn().mockImplementation(() => {
      const buffer = Buffer.from("generateDowDocument");
      return new ApiBase64SuccessResponse(buffer.toString("base64"), SuccessStatusCode.OK, docHeaders.dow);
    }),
  };
});
jest.mock("./ifp-document", () => {
  return {
    generateIFPDocument: jest.fn().mockImplementation(() => {
      const buffer = Buffer.from("generateIFPDocument");
      return new ApiBase64SuccessResponse(buffer.toString("base64"), SuccessStatusCode.OK, docHeaders.ifp);
    }),
  };
});
jest.mock("./requirements-checklist-document", () => {
  return {
    generateRequirementsChecklistDocument: jest.fn().mockImplementation(() => {
      const buffer = Buffer.from("generateRequirementsChecklistDocument");
      return new ApiBase64SuccessResponse(
        buffer.toString("base64"),
        SuccessStatusCode.OK,
        docHeaders.requirementsChecklist
      );
    }),
  };
});
jest.mock("./justification-and-approval-document.ts", () => {
  return {
    generateJustificationAndApprovalDocument: jest.fn().mockImplementation(() => {
      const buffer = Buffer.from("generateJustificationAndApprovalDocument");
      return new ApiBase64SuccessResponse(buffer.toString("base64"), SuccessStatusCode.OK, docHeaders.janda);
    }),
  };
});
jest.mock("./mrr-document.ts", () => {
  return {
    generateMarketResearchReportDocument: jest.fn().mockImplementation(() => {
      const buffer = Buffer.from("generateMarketResearchReportDocument");
      return new ApiBase64SuccessResponse(buffer.toString("base64"), SuccessStatusCode.OK, docHeaders.mrr);
    }),
  };
});

jest.mock("fs");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("Successful generate-document handler", () => {
  it("should return successful DoW document response", async () => {
    // GIVEN / ARRANGE
    const request = {
      ...validRequest,
      body: JSON.stringify(sampleDowRequest),
    };

    // WHEN / ACT
    const response = await handler(request, {} as Context);

    // THEN / ASSERT
    expect(response).toBeInstanceOf(SuccessBase64Response);
    expect(response.headers).toEqual(docHeaders.dow);
  });
  it("should return successful IGCE document response", async () => {
    // GIVEN / ARRANGE
    const request = {
      ...validRequest,
      body: JSON.stringify(sampleIgceRequest),
    };
    // WHEN / ACT
    const response = await handler(request, {} as Context);

    // THEN / ASSERT
    expect(response).toBeInstanceOf(SuccessBase64Response);
    expect(response.headers).toEqual(docHeaders.igce);
  });
  it("should return successful IFP document response", async () => {
    // GIVEN / ARRANGE
    const request = {
      ...validRequest,
      body: JSON.stringify(sampleIfpRequest),
    };

    // WHEN / ACT
    const response = await handler(request, {} as Context);

    // THEN / ASSERT
    expect(response).toBeInstanceOf(SuccessBase64Response);
    expect(response.headers).toEqual(docHeaders.ifp);
  });
  it("should return successful Requirements Checklist document response", async () => {
    // GIVEN / ARRANGE
    const request = {
      ...validRequest,
      body: JSON.stringify({
        ...sampleRequirementsChecklistRequest,
      }),
    };

    // WHEN / ACT
    const response = await handler(request, {} as Context);
    console.log("RESPONSE: ", JSON.stringify(response));
    // THEN / ASSERT
    expect(response).toBeInstanceOf(SuccessBase64Response);
    expect(response.headers).toEqual(docHeaders.requirementsChecklist);
  });

  it("should return successful J&A document response", async () => {
    // GIVEN / ARRANGE
    const request = {
      ...validRequest,
      body: JSON.stringify({
        ...sampleJustificationAndApproval,
      }),
    };

    // WHEN / ACT
    const response = await handler(request, {} as Context);
    console.log("RESPONSE: ", JSON.stringify(response));
    // THEN / ASSERT
    expect(response).toBeInstanceOf(SuccessBase64Response);
    expect(response.headers).toEqual(docHeaders.janda);
  });

  it("should return successful MRR document response", async () => {
    // GIVEN / ARRANGE
    const request = {
      ...validRequest,
      body: JSON.stringify({
        ...sampleMarketResearchReport,
      }),
    };

    // WHEN / ACT
    const response = await handler(request, {} as Context);
    console.log("RESPONSE: ", JSON.stringify(response));
    // THEN / ASSERT
    expect(response).toBeInstanceOf(SuccessBase64Response);
    expect(response.headers).toEqual(docHeaders.mrr);
  });
});

describe("Invalid requests for generate-document handler", () => {
  it.each([
    sampleDowRequest.templatePayload,
    sampleIgceRequest.templatePayload,
    sampleIfpRequest.templatePayload,
    sampleRequirementsChecklistRequest.templatePayload,
    sampleJustificationAndApproval.templatePayload,
    sampleMarketResearchReport.templatePayload
  ])("should return validation error when invalid document type", async (payload) => {
    // GIVEN / ARRANGE
    const invalidRequest = {
      ...validRequest,
      body: JSON.stringify({
        documentType: "invalid document",
        templatePayload: payload,
      }),
    };
    // WHEN / ACT
    const response = await handler(invalidRequest, {} as Context);
    const responseBody = JSON.parse(response?.body ?? "");
    // THEN / ASSERT
    expect(response).toBeInstanceOf(ValidationErrorResponse);
    expect(responseBody.message).toBe("Request failed validation");
  });
  it.each([
    DocumentType.DESCRIPTION_OF_WORK_DOCX,
    DocumentType.INDEPENDENT_GOVERNMENT_COST_ESTIMATE,
    DocumentType.INCREMENTAL_FUNDING_PLAN,
    DocumentType.EVALUATION_PLAN,
    DocumentType.REQUIREMENTS_CHECKLIST,
    DocumentType.JUSTIFICATION_AND_APPROVAL,
    DocumentType.MARKET_RESEARCH_REPORT
  ])("should return validation error when payload not an object", async (documentType) => {
    // GIVEN / ARRANGE
    const invalidRequest = {
      ...validRequest,
      body: JSON.stringify({
        documentType,
        templatePayload: "not an object",
      }),
    };
    // WHEN / ACT
    const response = await handler(invalidRequest, {} as Context);
    const responseBody = JSON.parse(response?.body ?? "");
    // THEN / ASSERT
    expect(response).toBeInstanceOf(ValidationErrorResponse);
    expect(responseBody.message).toBe("Request failed validation");
  });
  it.each([
    {
      documentType: DocumentType.DESCRIPTION_OF_WORK_DOCX,
      templatePayload: { ...sampleDowRequest.templatePayload, another: "prop" },
    },
    {
      documentType: DocumentType.INDEPENDENT_GOVERNMENT_COST_ESTIMATE,
      templatePayload: { ...sampleIgceRequest.templatePayload, additionalProp: "something" },
    },
    {
      documentType: DocumentType.INCREMENTAL_FUNDING_PLAN,
      templatePayload: { ...sampleIfpRequest.templatePayload, unknown: "prop" },
    },
    {
      documentType: DocumentType.REQUIREMENTS_CHECKLIST,
      templatePayload: { ...sampleRequirementsChecklistRequest.templatePayload, special: "prop" },
    },
    {
      documentType: DocumentType.JUSTIFICATION_AND_APPROVAL,
      templatePayload: { ...sampleJustificationAndApproval.templatePayload, notreal: "prop" },
    },
    {
      documentType: DocumentType.MARKET_RESEARCH_REPORT,
      templatePayload: { ...sampleMarketResearchReport.templatePayload, spurious: "prop" },
    },
  ])("should return validation error when payload has additional properties", async (requestBody) => {
    // GIVEN / ARRANGE
    const invalidRequest = {
      ...validRequest,
      body: JSON.stringify(requestBody),
    };
    // WHEN / ACT
    const response = await handler(invalidRequest, {} as Context);
    const responseBody = JSON.parse(response?.body ?? "");
    // THEN / ASSERT
    expect(response).toBeInstanceOf(ValidationErrorResponse);
    expect(responseBody.message).toBe("Request failed validation");
  });
});
