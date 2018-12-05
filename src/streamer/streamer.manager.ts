import * as aws from 'aws-sdk';
import { S3Instance } from '../utils/s3';
import { config } from '../config';

export class StreamerManager {
    static async getObjectContentLength(path: string): Promise<number> {
        const result = await S3Instance.headObject({ Bucket: config.s3.bucket, Key: path }).promise();
        return result.ContentLength!;
    }

    static getObjectStream(path: string, range?: string) {
        const params: aws.S3.GetObjectRequest = {
            Key: path,
            Bucket: config.s3.bucket
        };

        if (range) params.Range = range;

        return S3Instance
            .getObject(params)
            .createReadStream();
    }
}
