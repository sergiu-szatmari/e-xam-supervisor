import bcrypt from 'bcrypt';

class MeetingService {
  private static async hashPassword(password: string): Promise<string> {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
  }
  
  public async setMeetingPassword(roomId: string, token: string, password: string, timeout: number) {
    password = await MeetingService.hashPassword(password);
    
    const MeetingModel = { };
    return (MeetingModel as any).findOneAndUpdate(
      { roomId, token, password: { $exists: false } },
      { $set: { password, timeout }, $unset: { token: 1 } },
      { new: true }
    );
  }
}

export const meetingService = new MeetingService();
