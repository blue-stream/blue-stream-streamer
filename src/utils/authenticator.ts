import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

const cookieExtractor = function (req: Request) {
    return (req && req.cookies) ? req.cookies[config.authentication.cookieName] : null;
};

export class Authenticator {
    private static readonly jwtOptions: passportJwt.StrategyOptions = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: config.authentication.secret,
    };

    public static initialize(verifyCallback?: passportJwt.VerifiedCallback) {
        const strategy = new passportJwt.Strategy(Authenticator.jwtOptions, function (jwtPayload, next: passportJwt.VerifiedCallback) {
            if (verifyCallback) {
                verifyCallback(jwtPayload, next);
            } else {
                next(null, jwtPayload);
            }
        });

        passport.use(strategy);

        return passport.initialize();
    }

    public static middleware(req: Request, res: Response, next: NextFunction) {
        if (req.path === '/health') return next();
        return passport.authenticate('jwt', { session: false })(req, res, next);
    }
}
