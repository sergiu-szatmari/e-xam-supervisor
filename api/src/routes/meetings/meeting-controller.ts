import { NextFunction, Request, Response } from 'express';
import { errors } from '../../constants';
import { meetingService } from '../../services/meeting-service';

class MeetingController {

  public setPassword = async (req: Request<{ meetingId: string }, {}, { password: string, timeout: number }, {}>,
                              res: Response<{}>,
                              next: NextFunction) => {
    try {
      const { meetingId } = req.params;
      if (!meetingId) return next(errors.invalidParameter('meetingId'));
    
      const { password, timeout } = req.body;
    
      if (!password) return next(errors.invalidParameter('password'));
      if (!timeout) return next(errors.invalidParameter('timeout'));
    
      const meeting = await meetingService.setMeetingPassword(meetingId, password, timeout);
      if (!meeting) return next(errors.meetingPasswordAlreadySet);
    
      // TODO: jwt
      // const authToken =
      return res.status(200).json({ });
    } catch (err) {
      return next(err);
    }
  }
  
  public checkPassword = async (req: Request<{ meetingId: string }, {}, { password: string }, {}>,
                                res: Response<{}>,
                                next: NextFunction) => {
    try {
      const { meetingId } = req.params;
      const { password } = req.body;
      
      await meetingService.checkPassword(meetingId, password);
      
      // TODO: jwt
      return res.status(200).json({ });
    } catch (err) {
      return next(err);
    }
  }
}

export const meetingController = new MeetingController();
