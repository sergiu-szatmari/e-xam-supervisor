import { Router } from 'express';
import { meetingController } from './meeting-controller';
import { auth } from '../../middleware/auth';

export const meetingRouter = Router();

meetingRouter.put('/:meetingId', meetingController.setPassword);
meetingRouter.post('/:meetingId', meetingController.checkPassword);
meetingRouter.delete('/:meetingId', auth, meetingController.leaveRoom);
