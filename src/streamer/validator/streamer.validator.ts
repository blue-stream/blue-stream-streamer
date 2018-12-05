import { Request, Response, NextFunction } from 'express';
import { StreamerValidatons } from './streamer.validations';
import { PathInvalidError, RangeHeaderInvalidError } from '../../utils/errors/userErrors';

export class StreamerValidator {
    static canStreamVideo(req: Request, res: Response, next: NextFunction) {
        next(
            StreamerValidator.validatePath(req.params.path) ||
            StreamerValidator.validateRangeHeader(req.headers.range as string)
        );
    }

    static validatePath(path: string): undefined | PathInvalidError {
        if (!StreamerValidatons.isPathValid(path)) return new PathInvalidError();

        return undefined;
    }

    static validateRangeHeader(range: string): undefined | RangeHeaderInvalidError {
        if (range && !StreamerValidatons.isRangeHeaderValid(range)) return new RangeHeaderInvalidError();

        return undefined;
    }
}
