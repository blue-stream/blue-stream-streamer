import { Router } from 'express';
import { StreamerValidator } from './validator/streamer.validator';
import { StreamerController } from './streamer.contoller';
import { Wrapper } from '../utils/wrapper';

const StreamerRouter: Router = Router();

StreamerRouter.post('/', StreamerValidator.canCreate, Wrapper.wrapAsync(StreamerController.create));

export { StreamerRouter };
