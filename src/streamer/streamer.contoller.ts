import * as aws from 'aws-sdk';
import { Request, Response } from 'express';
import { config } from '../config';
import { StreamerManager } from './streamer.manager';
import * as fs from 'fs';

export class StreamerController {
    private static s3: aws.S3 = new aws.S3({
        accessKeyId: config.s3.accessKeyId,
        region: config.s3.region,
        secretAccessKey: config.s3.secretAccessKey,
        signatureVersion: config.s3.signatureVersion,
        endpoint: config.s3.endpoint,
        s3ForcePathStyle: true,
    });

    static async stream(req: Request, res: Response): Promise<void> {
        const path = req.params.path;
        let contentLength = 0;

        try {
            contentLength = await StreamerManager.getObjectContentLength(config.s3.bucket, path, StreamerController.s3);
        } catch (err) {
            res.sendStatus(404).send();
        }

        // TODO: Move to validators
        const videoNameAndSuffix = path.split('.');
        if (videoNameAndSuffix.length === 1 || videoNameAndSuffix[1] !== 'mp4') {
            res.sendStatus(400).send();
        }

        if (req.headers.range) {
            const range = req.headers.range.toString();

            const bytes = range.replace(/bytes=/, '').split('-');

            const regEx = new RegExp(/^bytes\=\d+\-(\d+)??$/);

            if (!regEx.test(range)) {
                res.sendStatus(400).send();
            }

            let [start, end] = bytes.map((value) => {
                return value ? parseInt(value, 10) : contentLength - 1;
            });

            if (end <= start || end > contentLength) {
                res.sendStatus(416).send();
            }

            let CHUNKSIZE = (end - start) + 1;

            // if (CHUNKSIZE > 1024 * 1024) {
            //     end = start + 1024 * 1024 - 1;
            //     CHUNKSIZE = (end - start) + 1;
            // }

            console.log(`bytes ${start}-${end}/${contentLength}`);
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${contentLength}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': CHUNKSIZE,
                'Content-Type': 'video/mp4',
            });

            StreamerController.s3.getObject({ Key: path, Range: `bytes=${start}-${end}`, Bucket: config.s3.bucket }).createReadStream().pipe(res);

        } else {
            res.writeHead(200, {
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4',
            });

            StreamerController.s3.getObject({ Key: path, Bucket: config.s3.bucket }).createReadStream().pipe(res);
        }
    }
}
