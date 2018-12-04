import { Request, Response, NextFunction } from 'express';
import { StreamerValidatons } from './streamer.validations';
import { PathInvalidError } from '../../utils/errors/userErrors';

export class StreamerValidator {
    static canStreamVideo(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validatePath(req.params.path));
    }

    static validatePath(path: string): undefined | PathInvalidError {
        if (!StreamerValidatons.isPathValid(path)) return new PathInvalidError();

        return undefined;
    }
}
