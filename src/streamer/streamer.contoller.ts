import { Request, Response } from 'express';
import { StreamerManager } from './streamer.manager';

export class StreamerController {
    static async create(req: Request, res: Response) {
        res.json(await StreamerManager.create(req.body));
    }
}
