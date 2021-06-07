import { Router } from 'express';
import { meetingController } from './meeting-controller';

export const meetingRouter = Router();

meetingRouter.put('/:meetingId', meetingController.setPassword);
meetingRouter.post('/:meetingId', meetingController.checkPassword);
