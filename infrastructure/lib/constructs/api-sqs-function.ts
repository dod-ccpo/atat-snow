import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as iam from "@aws-cdk/aws-iam";
import { ApiFunction, ApiFunctionProps } from "./api-function";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import { HttpMethod } from "../http";

export interface ApiSQSFunctionProps extends ApiFunctionProps {
  /**
   * The SQS queue where messages are sent
   */
  readonly queue: sqs.IQueue;
  /**
   * Optional param to create an SQS event source to receive queue messages
   */
  readonly createEventSource?: boolean;
}

/**
 * Creates a function resource with access to a queue for the ATAT API.
 *
 * A route is added to the API Gateway resource along with the packaged Lambda function.
 * The function is also granted necessary permissions on the SQS queue corresponding to
 * the HTTP method specified in the props
 */
export class ApiSQSFunction extends ApiFunction {
  /**
   * The SQS queue where messages are sent to or consumed from.
   */
  readonly queue: sqs.IQueue;

  constructor(scope: cdk.Construct, id: string, props: ApiSQSFunctionProps) {
    super(scope, id, props);
    this.queue = props.queue;
    this.fn.addEnvironment("ATAT_QUEUE_URL", props.queue.queueUrl);
    this.grantRequiredQueuePermissions();
    // allows the fn to subscribe to the queue using an EventSource
    if (props.createEventSource) {
      this.fn.addEventSource(new SqsEventSource(this.queue));
    }
  }

  private grantRequiredQueuePermissions(): iam.Grant | undefined {
    switch (this.method) {
      // Read-Only operations
      case HttpMethod.GET:
      case HttpMethod.HEAD:
        return this.queue.grantConsumeMessages(this.fn);
      // Read-Write operations
      case HttpMethod.POST:
      case HttpMethod.PUT:
      case HttpMethod.DELETE:
        return this.queue.grantSendMessages(this.fn);
      default:
        // This will allow Synthesis to continue; however, the error will stop the
        // CDK from moving forward with a diff or deploy action.
        cdk.Annotations.of(this).addError("Unknown HTTP method " + this.method);
        return undefined;
    }
  }
}
