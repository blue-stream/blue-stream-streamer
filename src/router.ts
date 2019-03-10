import { Router } from 'express';
import { StreamerRouter } from './streamer/streamer.router';
import { HealthRouter } from './utils/health/health.router';

const AppRouter: Router = Router();

AppRouter.use('/api/streamer', StreamerRouter);
AppRouter.use('/health', HealthRouter);

export { AppRouter };
