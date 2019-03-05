import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedResourceError } from '../utils/errors/userErrors';

export function hasRequiredToken(req: Request, res: Response, next: NextFunction) {
    const videoToken = (req && req.query) ? req.query[config.videoToken.tokenName] : null;

    if (!videoToken) throw new UnauthorizedResourceError();

    const path = req.params.path;
    const decodedToken = verify(videoToken, config.videoToken.secret) as { user: string, path: string };

    if (
        !decodedToken ||
        decodedToken.path !== path ||
        decodedToken.user !== req.user.id
    ) throw new UnauthorizedResourceError();

    return next();
}
