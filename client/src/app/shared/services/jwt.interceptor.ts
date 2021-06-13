import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { MeetingService } from './meeting.service';
import { catchError, mergeMap, take } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(public meetingService: MeetingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.meetingService
      .token$
      .pipe(
        take(1),
        mergeMap(token => {
          let { headers } = request;
          if (token) {
            headers = headers.append('Authorization', `Bearer ${ token }`);
          }

          return next.handle(request.clone({ headers }));
        }),
        catchError(err => {
          if (err.status === 401) console.error('Unauthorized');
          throw err;
        })
      )
  }
}
