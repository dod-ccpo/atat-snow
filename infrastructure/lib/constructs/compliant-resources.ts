import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

export interface SecureBucketProps {
  logTargetBucket: s3.IBucket | "self";
  logTargetPrefix: string;
  bucketProps?: s3.BucketProps;
}

/**
 * Creates a secure bucket with enabled server access logs.
 */
export class SecureBucket extends cdk.Construct {
  public readonly bucket: s3.IBucket;

  constructor(scope: cdk.Construct, id: string, props: SecureBucketProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, id, {
      // sensible defaults allowed to be overridden
      accessControl: props.logTargetBucket === "self" ? s3.BucketAccessControl.LOG_DELIVERY_WRITE : undefined,
      // passed in configuration options
      ...props.bucketProps,
      // secure defaults that cannot be overridden
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // NOTE: removed for dev purposes only, once envs are differentiated this will be fixed
      // autoDeleteObjects: false,
      serverAccessLogsBucket: props.logTargetBucket === "self" ? undefined : props.logTargetBucket,
      serverAccessLogsPrefix: props.logTargetPrefix,
    });
    this.bucket = bucket;
  }
}
