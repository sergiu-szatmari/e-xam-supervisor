import { Exception } from './models/exception';

export const errors = {
  unknown: new Exception(400, 'Unknown', 'Unknown error'),
  meetingPasswordAlreadySet: new Exception(404, 'MeetingPasswordAlreadySet', 'The meeting\'s password was already set'),
  invalidMeetingPassword: new Exception(422, 'InvalidMeetingPassword', 'The meeting password is invalid'),
  meetingPasswordExpired: new Exception(422, 'MeetingPasswordExpired', 'The meeting password has expired'),
  meetingNotFound: new Exception(404, 'MeetingNotFound', 'The requested meeting was not found'),
  
  invalidParameter: (param: string) => new Exception(422, 'InvalidParameter', `Missing or invalid parameter "${ param }"`)
}
