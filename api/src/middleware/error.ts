import { NextFunction, Request, Response } from 'express';
import { Exception, GenericError } from '../models/exception';

export default (err: Error, req: Request, res: Response) => {
  
  const code = String((err as any)?.code) || err.name || 'Unknown';
  let error: GenericError = {
    code,
    status: 400,
    message: err.message || 'Unknown error',
  };
  
  if (err instanceof Exception) {
    error = { code: err.code, status: err.status, message: err.message };
  }
  
  return res.status(error.status).json(error);
}
