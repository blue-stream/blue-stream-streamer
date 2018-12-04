import * as aws from 'aws-sdk';
import * as fs from 'fs';
import { config } from './../config';

const s3: aws.S3 = new aws.S3({
    region: config.s3.region,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    signatureVersion: config.s3.signatureVersion,
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
    return s3.putObject(putOptions).promise();
}

export function deleteFile(fileName: string) {
    return s3.deleteObject({ Bucket: bucket, Key: fileName }).promise();
}

export function listFiles(videoName?: string) {
    if (videoName) {
        s3.headObject({ Bucket: bucket, Key: videoName }, (err, data) => err ? console.log(err) : console.log(data));
    } else {
        s3.listObjectsV2({ Bucket: bucket }, (err, data) => err ? console.log(err) : console.log(data));
    }
}
