import { Router } from 'express';
import { uploadController } from './upload-controller';
import { auth } from '../../middleware/auth';

export const uploadRouter = Router();

uploadRouter.post('/:meetingId/', auth, uploadController.requestSignedURL);
uploadRouter.post('/:meetingId/chat', auth, uploadController.requestSignedURLForChat);
