import { Request, Response } from 'express';
import { Exception, GenericError } from '../models/exception';
import mongoose from 'mongoose';

export default (err: Error, req: Request, res: Response) => {
  
  const code = String((err as any)?.code) || err.name || 'Unknown';
  let error: GenericError = {
    code,
    status: 400,
    message: err.message || 'Unknown error',
  };
  
  if (err instanceof mongoose.Error.ValidationError) {
    error.code = err.name;
    error.status = 422;
    const key = Object.keys(err.errors)[0];
    error.message = err.errors[ key ].message;
  } else if (err instanceof Exception) {
    error = { code: err.code, status: err.status, message: err.message };
  }
  
  return res.status(error.status).json(error);
}
