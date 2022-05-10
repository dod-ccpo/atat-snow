import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { mapTasks, TasksMap } from "./sfn-lambda-invoke-task";
import { ApiSfnFunction } from "./api-sfn-function";
import { HttpMethod } from "../http";
import { StateMachine } from "./state-machine";

/**
 * Successful condition check
 */
export const successResponse = sfn.Condition.numberEquals("$.cspResponse.Payload.code", 200);

/**
 * Client error condition check
 */
export const clientErrorResponse = sfn.Condition.or(
  sfn.Condition.numberEquals("$.cspResponse.Payload.code", 400),
  sfn.Condition.numberEquals("$.cspResponse.Payload.code", 402),
  sfn.Condition.numberEquals("$.cspResponse.Payload.code", 404)
);
export interface ProvisioningWorkflowProps {
  environmentName: string;
}
export interface IProvisioningWorkflow {
  mappedTasks: TasksMap;
  workflow: sfn.IChainable;
  logGroup: logs.ILogGroup;
}

/**
 * A provisioning state machine components (e.g., funcs, tasks, conditions)
 * composed to form a workflow for provisioning jobs from SNOW to the CSPs.
 *
 */
export class ProvisioningWorkflow extends Construct implements IProvisioningWorkflow {
  readonly mappedTasks: TasksMap = {};
  readonly workflow: sfn.IChainable;
  readonly logGroup: logs.ILogGroup;
  readonly provisioningJobsQueue: sqs.IQueue;
  readonly resultFn: lambdaNodeJs.NodejsFunction;
  readonly provisioningQueueConsumer: ApiSfnFunction;
  readonly stateMachine: sfn.IStateMachine;

  constructor(scope: Construct, id: string, props: ProvisioningWorkflowProps) {
    super(scope, id);
    const { environmentName } = props;

    this.provisioningJobsQueue = new sqs.Queue(scope, "ProvisioningJobsQueue", {
      fifo: true,
      contentBasedDeduplication: true,
    });

    // Provisioning State machine functions
    const mockInvocationFn = new lambdaNodeJs.NodejsFunction(scope, "MockInvocationFunction", {
      entry: "api/provision/mock-invocation-fn.ts",
      runtime: lambda.Runtime.NODEJS_16_X,
    });
    this.resultFn = new lambdaNodeJs.NodejsFunction(scope, "ResultFunction", {
      entry: "api/provision/result-fn.ts",
      runtime: lambda.Runtime.NODEJS_16_X,
      environment: {
        PROVISIONING_QUEUE_URL: this.provisioningJobsQueue.queueUrl,
      },
    });
    this.provisioningQueueConsumer = new ApiSfnFunction(this, "ConsumeProvisioningJobRequest", {
      method: HttpMethod.GET,
      handlerPath: "api/provision/consume-provisioning-job.ts",
      functionPropsOverride: {
        timeout: cdk.Duration.seconds(20),
        environment: {
          PROVISIONING_QUEUE_URL: this.provisioningJobsQueue.queueUrl,
        },
      },
    });
    this.provisioningJobsQueue.grantSendMessages(this.resultFn);
    this.provisioningJobsQueue.grantConsumeMessages(this.provisioningQueueConsumer.fn);

    // Tasks for the Provisioning State Machine
    const tasks = [
      {
        id: "InvokeCspApi",
        props: {
          lambdaFunction: mockInvocationFn,
          inputPath: "$",
          resultPath: "$.cspResponse",
          outputPath: "$",
        },
      },
      {
        id: "Results",
        props: {
          lambdaFunction: this.resultFn,
          inputPath: "$",
          resultPath: "$.resultResponse",
          outputPath: "$",
        },
      },
    ];
    this.mappedTasks = mapTasks(scope, tasks);
    const { InvokeCspApi, Results } = this.mappedTasks;
    // update retry for the tasks
    InvokeCspApi.sfnTask.addRetry({ maxAttempts: 2, errors: ["MockCspApiError"] });
    InvokeCspApi.sfnTask.addCatch(Results.sfnTask, { errors: ["States.ALL"], resultPath: "$.catchErrorResult" });

    // State machine choices based on the tasks output
    const httpResponseChoices = new sfn.Choice(scope, "HttpResponse")
      .when(successResponse, Results.sfnTask)
      .when(clientErrorResponse, Results.sfnTask)
      .afterwards(); // converge choices and allows for additional tasks to be chained on

    // Composing state machine
    this.workflow = InvokeCspApi.sfnTask.next(httpResponseChoices);
    this.logGroup = new logs.LogGroup(scope, "StepFunctionsLogs", {
      retention: logs.RetentionDays.ONE_WEEK,
      logGroupName: `/aws/vendedlogs/states/StepFunctionsLogs${environmentName}`,
    });
    this.stateMachine = new StateMachine(this, "ProvisioningStateMachine", {
      stateMachineProps: {
        definition: this.workflow,
      },
      logGroup: this.logGroup,
    }).stateMachine;
  }
}
