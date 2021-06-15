import { Request, Response, Router } from 'express';
import { uploadRouter } from './upload/upload-router';
import { meetingRouter } from './meetings/meeting-router';
import { recordingEnabled } from '../middleware/auth';

export const apiRouter = Router();

apiRouter.use('/meetings', meetingRouter);
apiRouter.use('/upload', recordingEnabled, uploadRouter);

apiRouter.get('/', (req: Request, res: Response) =>
  res.status(200).json({ message: 'E-xam Supervisor API works' }));

