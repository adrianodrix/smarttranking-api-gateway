import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    this.logger.log(`Start request: ${now}`);

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`Duration request: ${Date.now() - now}ms`)),
      );
  }
}
