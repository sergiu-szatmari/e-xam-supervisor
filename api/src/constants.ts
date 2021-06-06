import { Exception } from './models/exception';

export const errors = {
  unknown: new Exception(400, 'Unknown', 'Unknown error'),
  
  invalidParameter: (param: string) => new Exception(422, 'InvalidParameter', `Missing or invalid parameter "${ param }"`)
}
