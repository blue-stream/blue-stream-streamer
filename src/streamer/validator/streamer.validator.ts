import { Request, Response, NextFunction } from 'express';
import { StreamerValidatons } from './streamer.validations';
import { PropertyInvalidError, IdInvalidError } from '../../utils/errors/userErrors';
import { IStreamer } from '../streamer.interface';

export class StreamerValidator {

    static canCreate(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validateProperty(req.body.streamer.property));
    }

    static canCreateMany(req: Request, res: Response, next: NextFunction) {
        const propertiesValidations: (Error | undefined)[] = req.body.streamers.map((streamer: IStreamer) => {
            return StreamerValidator.validateProperty(streamer.property);
        });

        next(StreamerValidator.getNextValueFromArray(propertiesValidations));
    }

    static canUpdateById(req: Request, res: Response, next: NextFunction) {
        next(
            StreamerValidator.validateId(req.params.id) ||
            StreamerValidator.validateProperty(req.body.streamer.property));
    }

    static canUpdateMany(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validateProperty(req.body.streamer.property));
    }

    static canDeleteById(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validateId(req.params.id));
    }

    static canGetById(req: Request, res: Response, next: NextFunction) {
        next(StreamerValidator.validateId(req.params.id));
    }

    static canGetOne(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetMany(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetAmount(req: Request, res: Response, next: NextFunction) {
        next();
    }

    private static validateProperty(property: string) {
        if (!StreamerValidatons.isPropertyValid(property)) {
            return new PropertyInvalidError();
        }

        return undefined;
    }

    private static validateId(id: string) {
        if (!StreamerValidatons.isIdValid(id)) {
            return new IdInvalidError();
        }

        return undefined;
    }

    private static getNextValueFromArray(validationsArray: (Error | undefined)[]) {
        let nextValue: Error | undefined;

        for (let index = 0; index < validationsArray.length; index++) {
            if (validationsArray[index] !== undefined) {
                nextValue = validationsArray[index];
            }
        }

        return nextValue;
    }
}
