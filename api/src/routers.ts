import { NextFunction, Request, Response, Router } from 'express';
import AWS from 'aws-sdk';
import config from 'config';
import { RecordingType, UploadRequestBody } from './models';

export const uploadRouter = Router();

AWS.config.update({ accessKeyId: config.get('aws.accessKeyId'), secretAccessKey: config.get('aws.secretAccessKey') });
AWS.config.region = config.get('aws.region');
const Bucket: string = config.get('aws.bucketName');

uploadRouter.post('/', async (req: Request<{}, {}, UploadRequestBody, {}>,
                        res: Response<AWS.S3.PresignedPost>,
                        next: NextFunction) => {
  try {
    const { peerId, recordingType, mimeType, roomId } = req.body;
    
    if (!peerId) return next(new Error('Invalid parameter (peerId)'));
    if (!roomId) return next(new Error('Invalid parameter (roomId)'));
    if (!recordingType || !Object.values(RecordingType).includes(recordingType)) return next(new Error('Invalid parameter (roomId)'));
    if (!mimeType) return next(new Error('Invalid parameter (mimeType)'));
    
    const s3 = new AWS.S3();
    const key = `meetings/${ roomId }/${ peerId }/${ recordingType }`;
    
    const signedUrlObj = s3.createPresignedPost({
      Expires: 180, // 3h
      Bucket,
      Fields: {
        'Content-Type': mimeType,
        key,
        acl: 'private'
      },
    })
    
    return res.status(200).json(signedUrlObj);
  } catch (err) {
    return next(err);
  }
});
