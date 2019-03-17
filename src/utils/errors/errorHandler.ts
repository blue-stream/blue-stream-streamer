import * as express from 'express';
import { ServerError, UserError } from './applicationError';
import { log } from '../logger';
import { TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';

export function tokenErrorHandler(error: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError ||
        error instanceof NotBeforeError
    ) {
        log('warn', 'Token Error', `${req.user && req.user.id} tried to access unauthorized resource. ${error.name} was thrown with status 403`, '', req.user && req.user.id);

        res.status(403).send();

        next();
    } else {
        next(error);
    }
}

export function userErrorHandler(error: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (error instanceof UserError) {
        log('info', 'User Error', `${error.name} was thrown with status ${error.status} and message ${error.message}`, '', req.user && req.user.id);

        res.status(error.status).send({
            type: error.name,
            message: error.message,
        });

        next();
    } else {
        next(error);
    }
}

export function serverErrorHandler(error: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (error instanceof ServerError) {
        log('warn', 'Server Error', `${error.name} was thrown with status ${error.status} and message ${error.message}`, '', req.user && req.user.id);

        res.status(error.status).send({
            type: error.name,
            message: error.message,
        });

        next();
    } else {
        next(error);
    }
}

export function unknownErrorHandler(error: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    log('error', 'Unknown Error', `${error.name} was thrown with status 500 and message ${error.message}`, '', req.user && req.user.id);

    res.status(500).send({
        type: error.name,
        message: error.message,
    });

    next(error);
}
