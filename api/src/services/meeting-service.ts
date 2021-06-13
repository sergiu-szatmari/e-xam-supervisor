import bcrypt from 'bcrypt';
import { MeetingModel } from '../models/meeting-model';
import { errors } from '../constants';
import { AuthTokenModel } from '../models/auth-token-model';

class MeetingService {
  public async setMeetingPassword(roomId: string, password: string, timeout: number) {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    
    const passwordExpireTs = new Date();
    passwordExpireTs.setSeconds(passwordExpireTs.getSeconds() + timeout);
    
    return MeetingModel.findOneAndUpdate(
      { roomId, password: { $exists: false } },
      { $set: { password, timeout, passwordExpireTs } },
      { new: true, upsert: true }
    );
  }
  
  public async checkPassword(roomId: string, password: string) {
    const meeting = await MeetingModel
      .findOne({ roomId })
      .select('+password')
      .exec();
    if (!meeting) throw errors.meetingNotFound;
    
    const passwordsMatch = await bcrypt.compare(password, meeting.password!);
    if (!passwordsMatch) throw errors.invalidMeetingPassword;
    
    const expired = new Date(meeting.passwordExpireTs!);
    if (expired.getTime() < new Date().getTime()) throw errors.meetingPasswordExpired;
    
    return true;
  }
  
  public async leaveRoom(roomId: string, jwt: string) {
    await AuthTokenModel.deleteOne({
      room: roomId, jwt
    });
    
    const roomMembersCount = await AuthTokenModel.countDocuments({ room: roomId });
    if (!roomMembersCount) await MeetingModel.deleteOne({ roomId });
    
    return true;
  }
}

export const meetingService = new MeetingService();
