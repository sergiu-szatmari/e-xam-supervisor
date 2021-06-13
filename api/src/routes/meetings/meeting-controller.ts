import { NextFunction, Request, Response } from 'express';
import { errors } from '../../constants';
import { meetingService } from '../../services/meeting-service';
import { authService } from '../../services/auth-service';

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
    
      const authToken = await authService.create(meeting.roomId, 'Supervisor');
      return res.status(200).json({ authToken });
    } catch (err) {
      return next(err);
    }
  }
  
  public checkPassword = async (req: Request<{ meetingId: string }, {}, { username: string, password: string }, {}>,
                                res: Response<{}>,
                                next: NextFunction) => {
    try {
      const { meetingId } = req.params;
      const { username, password } = req.body;
      
      await meetingService.checkPassword(meetingId, password);
      
      const authToken = await authService.create(meetingId, username);
      return res.status(200).json({ authToken });
    } catch (err) {
      return next(err);
    }
  }
  
  public leaveRoom = async (req: Request<{ meetingId: string }, {}, {}, {}>,
                            res: Response<{}>,
                            next: NextFunction) => {
    try {
      const { meetingId } = req.params;
      
      // @ts-ignore
      await meetingService.leaveRoom(meetingId, req.authToken!)
      return res.status(200).json({ });
    } catch (err) {
      return next(err);
    }
  }
}

export const meetingController = new MeetingController();
