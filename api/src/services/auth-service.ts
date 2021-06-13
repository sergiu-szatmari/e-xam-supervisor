import config from 'config';
import jwt from 'jsonwebtoken';

import { AuthToken, AuthTokenModel } from '../models/auth-token-model';

class AuthService {
  
  public async remove(jwt: string) {
    return AuthTokenModel.deleteOne({ jwt });
  }
  
  public async get(jwt: string) {
    return AuthTokenModel.findOne({ jwt });
  }
  
  public async create(roomId: string, username: string = '') {
    const secret: string = config.get('server.jwtSecret');
    const authToken = jwt.sign({ roomId }, secret);
    
    await AuthTokenModel.create<Partial<AuthToken>>({
      room: roomId,
      jwt: authToken,
      username
    } as AuthToken);
    
    return authToken;
  }
}

export const authService = new AuthService();
