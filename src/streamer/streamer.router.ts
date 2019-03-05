import { Router } from 'express';
import { StreamerValidator } from './validator/streamer.validator';
import { StreamerController } from './streamer.contoller';
import { Wrapper } from '../utils/wrapper';
import { hasRequiredToken } from './streamer.middleware';

const StreamerRouter: Router = Router();

StreamerRouter.get('/video/:path', hasRequiredToken, StreamerValidator.canStreamVideo, Wrapper.wrapAsync(StreamerController.stream));
StreamerRouter.get('/thumbnail/:path', StreamerValidator.canStreamThumbnail, Wrapper.wrapAsync(StreamerController.getSource));
StreamerRouter.get('/preview/:path', StreamerValidator.canStreamPreview, Wrapper.wrapAsync(StreamerController.getSource));

export { StreamerRouter };
