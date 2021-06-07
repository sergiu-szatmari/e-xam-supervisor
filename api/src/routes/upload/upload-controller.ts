import { NextFunction, Request, Response } from 'express';
import { RecordingType, UploadRequestBody } from '../../models/misc';
import { S3 } from 'aws-sdk';
import { errors } from '../../constants';
import { uploadService } from '../../services/upload-service';

class UploadController {
  
  public requestSignedURL = (req: Request<{}, {}, UploadRequestBody, {}>,
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
  }
  
  public requestSignedURLForChat = (req: Request<{}, {}, { roomId: string }, {}>,
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
  }
}

export const uploadController = new UploadController();
