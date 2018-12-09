import * as aws from 'aws-sdk';
import * as fs from 'fs';
import { config } from './../config';

export const S3Instance: aws.S3 = new aws.S3({
    region: config.s3.region,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    signatureVersion: config.s3.signatureVersion,
    endpoint: config.s3.endpoint,
    s3ForcePathStyle: true,
});

const bucket: string = config.s3.bucket;

export function uploadFile(filePath: string, fileName: string, contentType?: string) {
    const file = fs.createReadStream(filePath);
    const putOptions: aws.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: fileName,
        Body: file,
    };

    if (contentType) putOptions.ContentType = contentType;
    return S3Instance.putObject(putOptions).promise();
}

export function deleteFile(fileName: string) {
    return S3Instance.deleteObject({ Bucket: bucket, Key: fileName }).promise();
}

export function listFiles(videoName?: string) {
    if (videoName) {
        S3Instance.headObject({ Bucket: bucket, Key: videoName }, (err, data) => err ? console.log(err) : console.log(data));
    } else {
        S3Instance.listObjectsV2({ Bucket: bucket }, (err, data) => err ? console.log(err) : console.log(data));
    }
}

export async function getObjectContentLength(path: string): Promise<number> {
    const result = await S3Instance.headObject({ Bucket: config.s3.bucket, Key: path }).promise();
    return result.ContentLength!;
}

export function getObjectStream(path: string, range?: string) {
    const params: aws.S3.GetObjectRequest = {
        Key: path,
        Bucket: config.s3.bucket
    };

    if (range) params.Range = range;

    return S3Instance
        .getObject(params)
        .createReadStream();
}