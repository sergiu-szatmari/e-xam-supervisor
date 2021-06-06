import AWS from 'aws-sdk';
import config from 'config';
import { RecordingType } from '../models/misc';

AWS.config.update({ accessKeyId: config.get('aws.accessKeyId'), secretAccessKey: config.get('aws.secretAccessKey') });
AWS.config.region = config.get('aws.region');
const Bucket: string = config.get('aws.bucketName');

class UploadService {
  
  public getSignedUrl(roomId: string, mimeType: string, recordingType: RecordingType | null, peerId?: string): AWS.S3.PresignedPost {
    const s3 = new AWS.S3();
    const key = recordingType === null ?
      `meetings/${ roomId }/chat-history` : // Chat history upload
      `meetings/${ roomId }/${ peerId }/${ recordingType }`; // Recording upload
    
    return s3.createPresignedPost({
      Expires: 180, // 3h
      Bucket,
      Fields: {
        'Content-Type': mimeType,
        key,
        acl: 'private'
      },
    })
  }
}

export const uploadService = new UploadService();
