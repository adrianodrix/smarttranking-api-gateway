import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: 'Internal server error',
            error: 'Internal server error',
          };

    this.logger.error(
      `Http Status: ${status} Error Message: ${JSON.stringify(
        message,
      )} Exception: ${JSON.stringify(exception)}`,
    );

    res.status(status).json({
      timestamp: new Date().toISOString(),
      path: req.url,
      error: message,
    });
  }
}
