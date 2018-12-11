import { Request, Response, NextFunction } from 'express';
import { StreamerValidatons } from './streamer.validations';
import { PathInvalidError, RangeHeaderInvalidError } from '../../utils/errors/userErrors';
import { EndpointType } from '../endPoint.type';
import { config } from '../../config';

export class StreamerValidator {
    static canStreamVideo(req: Request, res: Response, next: NextFunction) {
        next(
            StreamerValidator.validatePath(req.params.path, config.sourceType.video) ||
            StreamerValidator.validateRangeHeader(req.headers.range as string)
        );
    }

    static canStreamThumbnail(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validatePath(req.params.path, config.sourceType.thumbnail));
    }

    static canStreamPreview(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validatePath(req.params.path, config.sourceType.preview));
    }

    static validatePath(path: string, fileExtension: RegExp): undefined | PathInvalidError {
        if (!StreamerValidatons.isPathValid(path, fileExtension)) return new PathInvalidError();

        return undefined;
    }

    static validateRangeHeader(range: string): undefined | RangeHeaderInvalidError {
        if (range && !StreamerValidatons.isRangeHeaderValid(range)) return new RangeHeaderInvalidError();

        return undefined;
    }
}
