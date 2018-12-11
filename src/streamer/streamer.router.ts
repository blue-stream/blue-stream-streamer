import { Router } from 'express';
import { StreamerValidator } from './validator/streamer.validator';
import { StreamerController } from './streamer.contoller';
import { Wrapper } from '../utils/wrapper';

const StreamerRouter: Router = Router();

StreamerRouter.get('/video/:path', StreamerValidator.canStreamVideo, Wrapper.wrapAsync(StreamerController.stream));
StreamerRouter.get('/thumbnail/:fileName', StreamerValidator.canStreamThumbnail, Wrapper.wrapAsync(StreamerController.getSource));
StreamerRouter.get('/preview/:fileName', StreamerValidator.canStreamPreview, Wrapper.wrapAsync(StreamerController.getSource));

export { StreamerRouter };
