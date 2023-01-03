export const sampleDowRequest = {
  documentType: "DESCRIPTION_OF_WORK_DOCX",
  templatePayload: {
    awardHistory: [
      { contractAwardType: "INITIAL_AWARD", modificationOrder: null, effectiveDate: "2022-05-20" },
      { contractAwardType: "MODIFICATION", modificationOrder: 3, effectiveDate: "2022-09-01" },
      { contractAwardType: "MODIFICATION", modificationOrder: 1, effectiveDate: "2023-02-01" },
    ],
    contractInformation: {
      currentContractExists: true,
      contractNumber: "928384",
      contractExpirationDate: "2022-12-09",
      incumbentContractorName: "Someone Making Decisions",
      previousTaskOrderNumber: "29284484",
    },
    toTitle: "Versatile Demo Package",
    scope: "Trying to build up another package that can be used for testing different parts of the system.",
    scopeSurge: "10",
    currentEnvironment: {
      currentEnvironmentExists: true,
      hasSystemDocumentation: false,
      hasMigrationDocumentation: false,
      envLocation: "CLOUD",
      envClassificationsCloud: [{ classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" }],
      envClassificationsOnprem: [],
      envInstances: [
        {
          instanceName: "Test DB",
          instanceLocation: "CLOUD",
          numberOfInstances: 2,
          usageDescription: null,
          anticipatedNeedOrUsage: null,
          operatingSystem: null,
          licensing: null,
          region: {
            name: "CONUS Central",
            description: "Central Continental United States",
            sequence: 2,
            group: "CONUS",
          },
          needForEntireTaskOrderDuration: false,
          selectedPeriods: [
            { periodType: "BASE", periodUnitCount: 1, periodUnit: "YEAR", optionOrder: null },
            { periodType: "OPTION", periodUnitCount: 7, periodUnit: "MONTH", optionOrder: 1 },
          ],
          classificationLevel: { classification: "U", display: "Unclassified - IL4", impactLevel: "IL4" },
          classifiedInformationTypes: [],
          dataEgressMonthlyAmount: null,
          dataEgressMonthlyUnit: null,
          memoryAmount: null,
          memoryUnit: null,
          storageAmount: null,
          storageUnit: null,
          storageType: null,
          numberOfVcpus: null,
          performanceTier: null,
          processorSpeed: null,
          pricingModel: "PAY_AS_YOU_GO",
          pricingModelExpiration: null,
          environmentType: null,
          operatingEnvironment: "SERVERLESS",
          deployedRegions: [],
          usersPerRegion: null,
          isTrafficSpikeEventBased: false,
          trafficSpikeEventDescription: null,
          isTrafficSpikePeriodBased: false,
          trafficSpikePeriodDescription: null,
          additionalInformation: null,
          currentUsageDescription: null,
          anticipatedNeedUsage: null,
        },
        {
          instanceName: "Test Current Env",
          instanceLocation: "CLOUD",
          numberOfInstances: 3,
          usageDescription: null,
          anticipatedNeedOrUsage: null,
          operatingSystem: "Linux",
          licensing: "MIT",
          region: {
            name: "CONUS Central",
            description: "Central Continental United States",
            sequence: 2,
            group: "CONUS",
          },
          needForEntireTaskOrderDuration: true,
          selectedPeriods: null,
          classificationLevel: { classification: "U", display: "Unclassified - IL2", impactLevel: "IL2" },
          classifiedInformationTypes: [],
          dataEgressMonthlyAmount: null,
          dataEgressMonthlyUnit: null,
          memoryAmount: null,
          memoryUnit: null,
          storageAmount: null,
          storageUnit: null,
          storageType: null,
          numberOfVcpus: null,
          performanceTier: "COMPUTE",
          processorSpeed: null,
          pricingModel: "PAY_AS_YOU_GO",
          pricingModelExpiration: null,
          environmentType: null,
          operatingEnvironment: "SERVERLESS",
          deployedRegions: [
            { name: "CONUS Central", description: "Central Continental United States", sequence: 2, group: "CONUS" },
            { name: "EUCOM", description: "United States European Command", sequence: 6, group: "OCONUS" },
            { name: "INDOPACOM", description: "United States Indo-Pacific Command", sequence: 7, group: "OCONUS" },
          ],
          usersPerRegion: null,
          isTrafficSpikeEventBased: false,
          trafficSpikeEventDescription: null,
          isTrafficSpikePeriodBased: false,
          trafficSpikePeriodDescription: null,
          additionalInformation: null,
          currentUsageDescription: "EVEN_USAGE",
          anticipatedNeedUsage: null,
        },
      ],
      additionalGrowth: true,
      anticipatedYearlyAdditionalCapacity: 0,
      currentEnvironmentReplicatedOptimized: "YES_OPTIMIZE",
      statementReplicatedOptimized: "",
      hasPhasedApproach: false,
      phasedApproachSchedule: "",
      needsArchitecturalDesignServices: false,
      architecturalDesignRequirement: {
        statement: "Helper for the app",
        applicationsNeedingDesign: "middleware app",
        externalFactors: null,
        source: "CURRENT_ENVIRONMENT",
        dataClassificationLevels: [{ classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" }],
      },
    },
    selectedClassificationLevels: [
      {
        classificationLevel: { classification: "U", display: "Unclassified - IL4", impactLevel: "IL4" },
        classifiedInformationTypes: [
          { name: "Foreign Government Information (FGI)", description: null, sequence: 9 },
          { name: "North Atlantic Treaty Organization (NATO) Information", description: null, sequence: 8 },
        ],
        dataEgressMonthlyAmount: 345,
        dataEgressMonthlyUnit: "GB",
        usersPerRegion: JSON.stringify([{ EAST: "1234" }, { WEST: "75" }]),
        dataIncrease: false,
        userGrowthEstimatePercentage: "346",
        userGrowthEstimateType: "SINGLE",
        dataGrowthEstimatePercentage: null,
        dataGrowthEstimateType: null,
        usersIncrease: false,
      },
      {
        classificationLevel: { classification: "U", display: "Unclassified - IL4", impactLevel: "IL4" },
        classifiedInformationTypes: [{ name: "Formerly Restricted Data", description: null, sequence: 4 }],
        dataEgressMonthlyAmount: 12231,
        dataEgressMonthlyUnit: "GB",
        usersPerRegion: JSON.stringify([{ CONUSEast: "5,000" }, { CONUSCentral: "1,000" }, { CONUSWest: "4,000" }]),
        dataIncrease: false,
        userGrowthEstimatePercentage: null,
        userGrowthEstimateType: "SINGLE",
        dataGrowthEstimatePercentage: null,
        dataGrowthEstimateType: "SINGLE",
        usersIncrease: false,
      },
    ],
    architecturalDesignRequirement: {
      statement: "Best cost effective architect",
      applicationsNeedingDesign: "cloud app",
      externalFactors: "economy",
      source: "DOW",
      dataClassificationLevels: [
        { classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" },
        { classification: "U", display: "Unclassified - IL4", impactLevel: "IL4" },
      ],
    },
    xaasOfferings: [
      {
        serviceOffering: {
          classificationInstances: [
            {
              classificationLevel: { classification: "U", display: "Unclassified - IL4", impactLevel: "IL4" },
              classifiedInformationTypes: [],
              selectedPeriods: null,
              needForEntireTaskOrderDuration: true,
              usageDescription: "Infrastrcture upkeep",
              dowTaskNumber: "4.2.1.2.",
            },
          ],
          otherServiceOffering: null,
          serviceOffering: { name: "Compute", description: null, serviceOfferingGroup: "COMPUTE", sequence: 1 },
        },
        instanceConfigurations: [
          {
            instanceName: "Testing Compute instance",
            instanceLocation: "CLOUD",
            numberOfInstances: 2,
            usageDescription: null,
            anticipatedNeedOrUsage: "Processing OLTP\r\n",
            operatingSystem: "Linux",
            licensing: null,
            region: {
              name: "CONUS Central",
              description: "Central Continental United States",
              sequence: 2,
              group: "CONUS",
            },
            needForEntireTaskOrderDuration: true,
            selectedPeriods: null,
            classificationLevel: { classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" },
            classifiedInformationTypes: [
              { name: "Foreign Government Information (FGI)", description: null, sequence: 9 },
            ],
            dataEgressMonthlyAmount: null,
            dataEgressMonthlyUnit: null,
            memoryAmount: 100,
            memoryUnit: "GB",
            storageAmount: 124,
            storageUnit: "GB",
            storageType: "BLOCK",
            numberOfVcpus: 6,
            performanceTier: "GENERAL",
            processorSpeed: 9999,
            pricingModel: null,
            pricingModelExpiration: null,
            environmentType: "DEV_TEST",
            operatingEnvironment: "VIRTUAL",
          },
        ],
      },
      {
        serviceOffering: {
          classificationInstances: [
            {
              classificationLevel: { classification: "U", display: "Unclassified - IL2", impactLevel: "IL2" },
              classifiedInformationTypes: [],
              selectedPeriods: [{ periodType: "OPTION", periodUnitCount: 7, periodUnit: "MONTH", optionOrder: 1 }],
              needForEntireTaskOrderDuration: false,
              usageDescription: "Testing",
              dowTaskNumber: "0.0.0.0",
            },
          ],
          otherServiceOffering: "Special Invesitation",
          serviceOffering: {
            name: "Migration Tools",
            description: null,
            serviceOfferingGroup: "DEVELOPER_TOOLS",
            sequence: 3,
          },
        },
        instanceConfigurations: [],
      },
      {
        serviceOffering: {
          classificationInstances: [
            {
              classificationLevel: { classification: "U", display: "Unclassified - IL4", impactLevel: "IL4" },
              classifiedInformationTypes: [],
              selectedPeriods: null,
              needForEntireTaskOrderDuration: true,
              usageDescription: "Infrastrcture upkeep",
              dowTaskNumber: "4.2.1.2.",
            },
          ],
          otherServiceOffering: null,
          serviceOffering: { name: "Database", description: null, serviceOfferingGroup: "DATABASE", sequence: 1 },
        },
        instanceConfigurations: [
          {
            instanceName: "Testing DB instance",
            instanceLocation: "CLOUD",
            numberOfInstances: 2,
            usageDescription: null,
            anticipatedNeedOrUsage: null,
            operatingSystem: null,
            licensing: null,
            region: null,
            needForEntireTaskOrderDuration: true,
            selectedPeriods: null,
            classificationLevel: { classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" },
            classifiedInformationTypes: [],
            dataEgressMonthlyAmount: null,
            dataEgressMonthlyUnit: null,
            memoryAmount: null,
            memoryUnit: null,
            storageAmount: null,
            storageUnit: null,
            storageType: null,
            numberOfVcpus: null,
            performanceTier: null,
            processorSpeed: null,
            pricingModel: null,
            pricingModelExpiration: null,
            databaseLicensing: null,
            databaseType: null,
            databaseTypeOther: null,
          },
        ],
      },
    ],
    crossDomainSolutions: {
      anticipatedNeedOrUsage: "need to transfer a lot of documents ",
      crossDomainSolutionRequired: true,
      selectedPeriods: [
        { periodType: "OPTION", periodUnitCount: 7, periodUnit: "MONTH", optionOrder: 1 },
        { periodType: "BASE", periodUnitCount: 1, periodUnit: "YEAR", optionOrder: null },
      ],
      needForEntireTaskOrderDuration: false,
      projectedFileStreamType: "PDF",
      // TODO: find out how this is comming over in string format
      trafficPerDomainPair: [
        {
          name: "S_TO_U",
          dataQuantity: "3495 GB",
        },
      ],
    },
    cloudSupportPackages: [
      {
        instanceName: "Special porting",
        instanceLocation: "CLOUD",
        numberOfInstances: 3,
        usageDescription: null,
        anticipatedNeedOrUsage: null,
        operatingSystem: null,
        licensing: null,
        region: { name: "SOUTHCOM", description: "United States Southern Command", sequence: 8, group: "OCONUS" },
        needForEntireTaskOrderDuration: true,
        selectedPeriods: null,
        classificationLevel: { classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" },
        classifiedInformationTypes: [{ name: "Foreign Government Information (FGI)", description: null, sequence: 9 }],
        dataEgressMonthlyAmount: null,
        dataEgressMonthlyUnit: null,
        memoryAmount: null,
        memoryUnit: null,
        storageAmount: null,
        storageUnit: null,
        storageType: null,
        numberOfVcpus: null,
        performanceTier: null,
        processorSpeed: null,
        pricingModel: "PAY_AS_YOU_GO",
        pricingModelExpiration: null,
        personnelOnsiteAccess: "YES",
        serviceType: "PORTABILITY_PLAN",
      },
      {
        instanceName: "Advisory Assistance for Cloud perforamcne ",
        instanceLocation: "CLOUD",
        numberOfInstances: null,
        usageDescription: null,
        anticipatedNeedOrUsage: null,
        operatingSystem: null,
        licensing: null,
        region: null,
        needForEntireTaskOrderDuration: true,
        selectedPeriods: null,
        classificationLevel: { classification: "U", display: "Unclassified - IL5", impactLevel: "IL5" },
        classifiedInformationTypes: [],
        dataEgressMonthlyAmount: null,
        dataEgressMonthlyUnit: null,
        memoryAmount: null,
        memoryUnit: null,
        storageAmount: null,
        storageUnit: null,
        storageType: null,
        numberOfVcpus: null,
        performanceTier: null,
        processorSpeed: null,
        pricingModel: null,
        pricingModelExpiration: null,
        personnelOnsiteAccess: "NO",
        serviceType: "ADVISORY_ASSISTANCE",
      },
    ],
    contractType: { firmFixedPrice: true, timeAndMaterials: true, contractTypeJustification: "Really need this." },
    periodOfPerformance: {
      basePeriod: { periodType: "BASE", periodUnitCount: 1, periodUnit: "YEAR", optionOrder: null },
      optionPeriods: [
        { periodType: "OPTION", periodUnitCount: 36, periodUnit: "WEEK", optionOrder: 2 },
        { periodType: "OPTION", periodUnitCount: 7, periodUnit: "MONTH", optionOrder: 1 },
      ],
      popStartRequest: true,
      requestedPopStartDate: "2022-11-30",
      timeFrame: "NO_SOONER_THAN",
      recurringRequirement: false,
    },
    securityRequirements: [
      {
        advisoryServicesSecret: [
          { name: "Foreign Government Information (FGI)", description: null, sequence: 9 },
          { name: "Controlled Unclassified Information (CUI)", description: null, sequence: 11 },
          { name: "Restricted Data", description: null, sequence: 2 },
        ],
        advisoryServicesTopSecret: [
          { name: "Foreign Government Information (FGI)", description: null, sequence: 9 },
          { name: "Restricted Data", description: null, sequence: 2 },
          {
            name: "National Intelligence Information: Sensitive Compartmented Information (SCI)",
            description: null,
            sequence: 5,
          },
        ],
        serviceOfferingGroup: "ADVISORY_ASSISTANCE",
        tsContractorClearanceType: "TS_SCI",
      },
    ],
    contractConsiderations: {
      potentialConflictOfInterest: true,
      conflictOfInterestExplanation: "Company investment in same solutions.",
      packagingShippingNoneApply: false,
      packagingShippingOther: false,
      packagingShippingOtherExplanation: "",
      contractorProvidedTransfer: false,
      piiPresent: false,
      systemOfRecordName: "",
      travel: [
        {
          durationInDays: 14,
          numberOfTravelers: 2,
          numberOfTrips: 6,
          selectedPeriods: [{ periodType: "OPTION", periodUnitCount: 7, periodUnit: "MONTH", optionOrder: 1 }],
          tripLocation: "Canada",
        },
      ],
    },
    sensitiveInformation: { section508Sufficient: true, accessibilityReqs508: "Some requirments for section 508." },
  },
};

export const sampleIgceRequest = {
  documentType: "INDEPENDENT_GOVERNMENT_COST_ESTIMATE",
  templatePayload: {
    surgeCapabilities: 34,
    fundingDocument: {
      fundingType: "FS_FORM",
      orderNumber: "O2206-097-097-184790",
      gtcNumber: "A2201-097-097-18092",
    },
    contractingShop: "DITCO",
    periodsEstimate: [
      {
        period: { periodUnit: "YEAR", periodUnitCount: "1", periodType: "BASE", optionOrder: "" },
        periodLineItems: [
          {
            idiqClin: "x001/x017 Cloud UNCLASSIFIED",
            dowTaskNumber: "4.2.2.1",
            serviceTitle: "Cloud Audit/Monitoring Tools",
            itemDescription: "Monitoring network data",
            unitPrice: 394.38,
            quantity: 1,
            unit: "period",
            contractType: "FFP",
          },
          {
            idiqClin: "x001/x017 Cloud UNCLASSIFIED",
            dowTaskNumber: "4.2.2.2",
            serviceTitle: "Special custom built app - not SNOW",
            itemDescription: "To handle special cases that can not be done in SNOW",
            unitPrice: 799.0,
            quantity: 2,
            unit: "period",
            contractType: "FFP",
          },
        ],
      },
      {
        period: { periodUnit: "WEEK", periodUnitCount: 12, periodType: "OPTION", optionOrder: 2 },
        periodLineItems: [
          {
            idiqClin: "x004/x020 Cloud Support SECRET CLASSIFIED",
            dowTaskNumber: "4.2.2.4",
            serviceTitle: "Application",
            itemDescription: "Basic App ",
            unitPrice: 1200.0,
            quantity: 1,
            unit: "month",
            contractType: "T&M",
          },
          {
            idiqClin: "x001/x017 Cloud UNCLASSIFIED",
            dowTaskNumber: "4.2.2.3",
            serviceTitle: "Application",
            itemDescription: "Staging App",
            unitPrice: 1200.0,
            unit: "months",
            quantity: 10,
            contractType: "FFP",
          },
        ],
      },
    ],
    instructions: {
      estimateDescription: "Through this service, and that service",
      assumptionsMade: "Using this calculator, and years of experience",
      toolsUsed: "List of tools used: calculator service 1, calculator service 2",
      informationSource: "This government agency, that government agency",
      previousEstimateComparison: "Overestimated how much time was needed",
    },
  },
};

export const sampleIfpRequest = {
  documentType: "INCREMENTAL_FUNDING_PLAN",
  templatePayload: {
    requirementsTitle: "Versatile Demo Package",
    missionOwner: "Jewel Heart",
    financialPoc: "Ester Crest",
    estimatedTaskOrderValue: 125000.55,
    initialAmount: 50000.55,
    remainingAmount: 75000,
    fundingDocument: { fundingType: "FS_FORM", orderNumber: "O-23434-34234" },
    fundingIncrements: [
      { amount: 25000, description: "2nd QTR FY23", order: 1 },
      { amount: 50000, description: "3rd QTR FY23", order: 2 },
    ],
    scheduleText: "Funding Increment #1:\n2nd QTR FY23 - $25,000.00\nFunding Increment #2:\n3rd QTR FY23 - $50,000.00",
    contractNumber: "TBD",
    taskOrderNumber: "TBD",
  },
};

export const fundingDocumentWithMiprNumber = {
  fundingType: "MIPR",
  miprNumber: "M2206-07-077-458790",
};

export const sampleEvalPlanRequest = {
  documentType: "EVALUATION_PLAN",
  templatePayload: {
    taskOrderTitle: "Maria Mission Owner's Eval Plan",
    sourceSelection: "NO_TECH_PROPOSAL",
    method: "LPTA",
    standardSpecifications: ["string"],
    customSpecifications: ["string"],
    standardDifferentiators: ["string"],
    customDifferentiators: ["string"],
  },
};

export const sampleRequirementsChecklistRequest = {
  documentType: "REQUIREMENTS_CHECKLIST",
  templatePayload: {
    projectOverview: {
      title: "Versatile Demo Package",
      scope: "Trying to build up another package that can be used for testing different parts of the system.",
      emergencyDeclaration: true,
    },
    organization: {
      agency: "Federal Bureau Of Investigation (FBI/ITD)",
      name: "Special Div",
    },
    contacts: {
      missionOwnerName: "ADM Jewel Heart IV",
      cor: {
        type: "COR",
        name: "Dak Prescott",
        email: "dak@cowboys.com",
        phoneNumber: "+1 (703) 123-4567, ext. 820",
        dodaac: "aaa999",
      },
      acor: {
        type: "ACOR",
        name: "Yoda",
        email: "yoda@atat.com",
        phoneNumber: "+1 (999) 123-4567, ext. 999",
        dodaac: "bbb888",
      },
    },
    currentContract: {
      exists: true,
      incumbentContractorName: "Someone Making Decisions",
      contractNumber: "928384",
      taskOrderNumber: "29284484",
      contractExpiration: "2022-12-09",
    },
    exceptionToFairOpportunity: "YES_FAR_16_505_B_2_I_B",
    periodOfPerformance: {
      basePeriod: { periodType: "BASE", periodUnitCount: 1, periodUnit: "YEAR", optionOrder: null },
      optionPeriods: [
        { periodType: "OPTION", periodUnitCount: 36, periodUnit: "WEEK", optionOrder: 4 },
        { periodType: "OPTION", periodUnitCount: 7, periodUnit: "MONTH", optionOrder: 2 },
      ],
      popStartRequest: true,
      requestedPopStartDate: "2022-11-30",
      timeFrame: "NO_SOONER_THAN",
      recurringRequirement: false,
    },
    contractType: { firmFixedPrice: true, timeAndMaterials: true, justification: "Really need this." },
    sensitiveInformation: {
      baaRequired: true,
      potentialToBeHarmful: true,
      foiaContact: {
        fullName: "Info Protector",
        email: "protector@mail.mil",
        address: "123 FOIA St\nCrystal, VA 22001\nUnited States of America",
      },
      section508: { section508Sufficient: true },
    },
  },
};
