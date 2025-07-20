import { RemovalPolicy } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

/**
 *
 */
export class WorkflowServiceS3BucketConstruct extends Construct {
  public s3Bucket: Bucket

  /**
   *
   */
  constructor(scope: Construct, id: string) {
    super(scope, id)
    this.s3Bucket = this.createBucket(scope, id)
  }

  /**
   *
   */
  private createBucket(scope: Construct, id: string): Bucket {
    const bucketName = `${id}-BucketV3`.toLowerCase()
    const bucket = new Bucket(scope, bucketName, {
      bucketName,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    bucket.applyRemovalPolicy(RemovalPolicy.DESTROY)

    return bucket
  }
}
