import mongoose, { Document, Schema } from 'mongoose';

export interface AuthToken extends Document {
  room: string;
  jwt: string;
  username: string;
}

const authTokenSchema = new Schema({
  room: {
    type: String,
    index: true,
    required: true,
  },
  
  jwt: {
    type: String,
    index: true,
    required: true,
  },
  
  username: {
    type: String
  }
});

export const AuthTokenModel = mongoose.model<AuthToken>('auth-token', authTokenSchema);
