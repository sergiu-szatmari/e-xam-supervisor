import mongoose, { Document, Schema } from 'mongoose';

export interface Meeting extends Document {
  roomId: string;
  password?: string;
  timeout?: number;
  passwordExpireTs?: Date;
}

const meetingSchema = new Schema({
  roomId: {
    type: String,
    required: [true, 'Room ID is required'],
  },
  
  password: {
    type: String,
  },
  
  passwordExpireTs: {
    type: Date
  }
});

export const MeetingModel = mongoose.model<Meeting>('meeting', meetingSchema);
