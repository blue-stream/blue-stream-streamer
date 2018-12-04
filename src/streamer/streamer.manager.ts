import * as aws from 'aws-sdk';

export class StreamerManager {
    static async getObjectContentLength(bucket: string, path: string, s3: aws.S3): Promise<number> {
        const result = await s3.headObject({ Bucket: bucket, Key: path }).promise();
        return result.ContentLength!;
    }
}
