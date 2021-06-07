import { Router } from 'express';
import { uploadController } from './upload-controller';

export const uploadRouter = Router();

uploadRouter.post('/', uploadController.requestSignedURL);
uploadRouter.post('/chat', uploadController.requestSignedURLForChat);
