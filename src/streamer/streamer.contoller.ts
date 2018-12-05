import { Request, Response } from 'express';
import { StreamerManager } from './streamer.manager';
import { config } from '../config';

export class StreamerController {

    static async stream(req: Request, res: Response) {
        const path = req.params.path;
        let contentLength = 0;

        try {
            contentLength = await StreamerManager.getObjectContentLength(path);
        } catch (err) {
            return res.sendStatus(404).send();
        }

        if (req.headers.range) {
            const range = req.headers.range.toString();

            const bytes = range.replace(/bytes=/, '').split('-');

            let [start, end] = bytes.map((value) => {
                return value ? parseInt(value, 10) : contentLength - 1;
            });

            if (end <= start || end > contentLength) {
                res.sendStatus(416).send();
                return;
            }

            let chunkSize = (end - start) + 1;

            if (chunkSize > config.streamer.maxChunkSize) {
                end = start + config.streamer.maxChunkSize - 1;
                end = Math.min(end, contentLength - 1);
                chunkSize = config.streamer.maxChunkSize;
            }

            console.log(`bytes ${start}-${end}/${contentLength}`);
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${contentLength}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            });

            return StreamerManager.getObjectStream(path, `bytes=${start}-${end}`).pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4',
            });

            return StreamerManager.getObjectStream(path).pipe(res);
        }
    }
}
