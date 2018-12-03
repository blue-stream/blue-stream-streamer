import { Router } from 'express';
import { StreamerRouter } from './streamer/streamer.router';

const AppRouter: Router = Router();

AppRouter.use('/api/streamer', StreamerRouter);

export { AppRouter };
