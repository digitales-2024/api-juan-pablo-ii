   // src/common/interceptors/date-transform.interceptor.ts
   import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { formatInTimeZone } from 'date-fns-tz';

  @Injectable()
  export class DateTransformInterceptor implements NestInterceptor {
    private readonly timezone: string = 'America/Lima';
    private readonly dateFormat: string = 'yyyy-MM-dd HH:mm:ss';

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(map(data => this.transformDates(data)));
    }

    private transformDates(data: any): any {
      if (Array.isArray(data)) {
        return data.map(item => this.transformDates(item));
      } else if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
          if (data[key] instanceof Date) {
            data[key] = formatInTimeZone(data[key], this.timezone, this.dateFormat);
          } else if (typeof data[key] === 'object') {
            data[key] = this.transformDates(data[key]);
          }
        }
      }
      return data;
    }
  }