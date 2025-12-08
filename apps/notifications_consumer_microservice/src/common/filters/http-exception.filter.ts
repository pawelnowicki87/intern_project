import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  InternalError,
} from '@shared/errors/domain-errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ForbiddenError) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof InternalError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any)?.message ?? 'Internal server error';

    this.logger.error(
      `[${request.method}] ${request.url} -> ${JSON.stringify(message)}`,
      (exception as any)?.stack || '',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
