import * as apigw from "@aws-cdk/aws-apigateway";
import { UserPool } from "@aws-cdk/aws-cognito";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambdaNodejs from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";

export class AtatWebApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a shared DynamoDB table that will be used by all the functions in the project.
    const table = new dynamodb.Table(this, "AtatTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });
    const tableOutput = new cdk.CfnOutput(this, "TableName", {
      value: table.tableName,
    });

    const userPool = new UserPool(this, "PocUserPool");
    const userPoolClient = userPool.addClient("api-app-client", {
      authFlows: {
        userPassword: true,
      },
    });
    const userPoolDomain = userPool.addDomain("api-app-domain", {
      cognitoDomain: {
        domainPrefix: "atatapi",
      },
    });
    const poolDomainOutput = new cdk.CfnOutput(this, "UserPoolDomain", {
      value: userPoolDomain.domainName,
    });

    // Creates a shared API Gateway that all the functions will be able to add routes to.
    // Ideally we'd define different stages for dev, test, and staging. For now, a single
    // stage for everything being dev is good enough for a proof of concept
    const restApi = new apigw.RestApi(this, "AtatWebApi", {
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL],
      },
      defaultCorsPreflightOptions: {
        allowCredentials: false,
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
      },
    });
    restApi.root.addMethod("ANY");
    const restUrlOutput = new cdk.CfnOutput(this, "RootApiUri", {
      value: restApi.url ?? "",
    });

    const sharedFunctionProps: lambdaNodejs.NodejsFunctionProps = {
      environment: {
        ATAT_TABLE_NAME: table.tableName,
      },
      bundling: {
        externalModules: ["aws-sdk"],
      },
    };

    // NEW FUNCTIONS GET DEFINED HERE
    // Some notes:
    //   - You can use `applications/portfolioDrafts/index.ts` to get a "Hello world" response when
    //     initially testing to make sure the infrastructure works
    //   - Each function gets defined using `lambdaNodejs.NodejsFunction` for now. You can probably
    //     reuse the `sharedFunctionProps`, especially for the early functions
    //   - Define new portfolioDrafts routes as `portfolioDrafts.addResource`
    //   - You can define routes with variables/parameters in the path by using the typical brace notation
    //     for example {portfolioDraft}
    //   - Make sure to call `table.grantReadData` or `table.grantReadWriteData` as appropriate (so for GETs
    //     try to only grant read)
    // We definitely want to improve the ergonomics of this and doing so is a high priority; however, following
    // these examples and steps should be a good start to allow progress while that work is happening.
    const portfolioDrafts = restApi.root.addResource("portfolioDrafts");
    const portfolioDraftId = portfolioDrafts.addResource("{portfolioDraftId}");
    const portfolio = portfolioDraftId.addResource("portfolio");

    const getPortfolioDraftsFn = new lambdaNodejs.NodejsFunction(this, "PortfolioDraftsGetFunction", {
      entry: "applications/portfolioDrafts/index.ts",
      ...sharedFunctionProps,
    });
    portfolioDrafts.addMethod("GET", new apigw.LambdaIntegration(getPortfolioDraftsFn));
    // Prevent the GET function from being able to write to DynamoDB (it doesn't need to)
    table.grantReadData(getPortfolioDraftsFn);

    // operationId: createPortfolioDraft
    const createPortfolioDraftFn = new lambdaNodejs.NodejsFunction(this, "createPortfolioDraft", {
      entry: "applications/portfolioDrafts/createPortfolioDraft.ts",
      ...sharedFunctionProps,
    });

    // deletePortfolioDraft
    const deletePortfolioDraftFn = new lambdaNodejs.NodejsFunction(this, "DeletePortfolioDraftFunction", {
      entry: "applications/portfolioDrafts/portfolio/delete.ts",
      ...sharedFunctionProps,
    });
    portfolio.addMethod("DELETE", new apigw.LambdaIntegration(deletePortfolioDraftFn));
    table.grantReadWriteData(deletePortfolioDraftFn);

    portfolioDrafts.addMethod("POST", new apigw.LambdaIntegration(createPortfolioDraftFn));
    table.grantReadWriteData(createPortfolioDraftFn);

    // -- operationIds from API spec ---
    // operationId: getPortfolioDrafts
    // operationId: getPortfolioDraft
    // operationId: getPortfolioStep
    // operationId: createPortfolioStep
    // operationId: getFundingStep
    // operationId: createFundingStep
    // operationId: getApplicationStep
    // operationId: createApplicationStep
    // operationId: submitPortfolioDraft
    // operationId: uploadTaskOrder
    // operationId: deleteTaskOrder
  }
}
