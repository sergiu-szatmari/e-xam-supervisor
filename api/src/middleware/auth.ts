import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import { errors } from '../constants';
import { authService } from '../services/auth-service';

const secret: string = config.get('server.jwtSecret');

export async function auth(req: Request<{ meetingId: string }, any, any, any>,
                           res: Response,
                           next: NextFunction) {
  if (!req.headers || !req.headers.authorization) return next(errors.unauthorized);
  
  const [, token] = req.headers.authorization.split(' ');

  try { jwt.verify(token, secret); }
  catch { return next(errors.unauthorized); }

  const authEntry = await authService.get(token);
  if (!authEntry) return next(errors.unauthorized);
  
  const decoded = jwt.decode(token);
  if (!decoded) return next(errors.unauthorized);
  
  if ((decoded as any).roomId !== req.params.meetingId ||
      authEntry.room !== req.params.meetingId) {
        return next(errors.unauthorized);
  }
  
  req.authToken = token;
  return next();
}
