import { NestFactory } from '@nestjs/core';
import * as momentTimeZone from 'moment-timezone';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ValidationBodyPipe } from './pipes/validation-body.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(new ValidationBodyPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor());

  Date.prototype.toJSON = function (): any {
    return momentTimeZone(this)
      .tz('America/Sao_Paulo')
      .format('YYYY-MM-DD HH:mm:ss.SSS');
  };

  await app.listen(8080);
}
bootstrap();
