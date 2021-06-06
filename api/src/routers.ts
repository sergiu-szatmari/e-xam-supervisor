import { NextFunction, Request, Response, Router } from 'express';
import { S3 } from 'aws-sdk';
import { RecordingType, UploadRequestBody } from './models/misc';
import { uploadService } from './services/upload-service';
import { errors } from './constants';

export const uploadRouter = Router();

uploadRouter.post('/', (req: Request<{}, {}, UploadRequestBody, {}>,
                        res: Response<S3.PresignedPost>,
                        next: NextFunction) => {
  try {
    const { peerId, recordingType, mimeType, roomId } = req.body;
    
    if (!peerId) return next(errors.invalidParameter('peerId'));
    if (!roomId) return next(errors.invalidParameter('roomId'));
    if (!recordingType || !Object.values(RecordingType).includes(recordingType)) return next(errors.invalidParameter('roomId'));
    if (!mimeType) return next(errors.invalidParameter('mimeType'));
    
    const signedUrlObject = uploadService.getSignedUrl(roomId, mimeType, recordingType, peerId);
    return res.status(200).json(signedUrlObject);
  } catch (err) {
    return next(err);
  }
});

uploadRouter.post('/chat', (req: Request<{}, {}, { roomId: string }, {}>,
                            res: Response<S3.PresignedPost>,
                            next: NextFunction) => {
  try {
    const { roomId } = req.body;
    if (!roomId) return next(errors.invalidParameter('roomId'));
    
    const signedUrlObject = uploadService.getSignedUrl(roomId, 'text/csv;charset=utf-8', null);
    return res.status(200).json(signedUrlObject);
  } catch (err) {
    return next(err);
  }
});

export const meetingsRouter = Router();

meetingsRouter.post('/:meetingId', async (req: Request<{ meetingId: string }, {}, { token: string, password: string, timeout: number }>,
                                          res: Response<{}>,
                                          next: NextFunction) => {
  try {
    const { meetingId } = req.params;
    if (!meetingId) return next(errors.invalidParameter('meetingId'));
    
    const { token, password, timeout } = req.body;
    if (!token) return next(errors.invalidParameter('token'));
    if (!password) return next(errors.invalidParameter('password'));
    if (!timeout) return next(errors.invalidParameter('timeout'));
    
    // await meetingService.setPassword(meetingId, token, password, timeout);
    return res.status(200).json({ });
  } catch (err) {
    return next(err);
  }
});
