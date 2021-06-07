import { Request, Response, Router } from 'express';
import { uploadRouter } from './upload/upload-router';
import { meetingRouter } from './meetings/meeting-router';

export const apiRouter = Router();

apiRouter.use('/upload', uploadRouter);
apiRouter.use('/meetings', meetingRouter);

apiRouter.get('/', (req: Request, res: Response) =>
  res.status(200).json({ message: 'E-xam Supervisor API works' }));
