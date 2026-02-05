import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionsFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(RpcExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    const context = host.switchToRpc();
    const data = context.getData();

    this.logger.error(
      `Error handling message: ${JSON.stringify(data)}`,
      (exception as any)?.stack || exception,
    );

    return throwError(() => new RpcException(exception as any));
  }
}