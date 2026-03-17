import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, unknown>;
        // class-validator envía un arreglo de mensajes; se unen para mejorar la legibilidad.
        if (Array.isArray(res['message'])) {
          errorMessage = (res['message'] as string[]).join(', ');
        } else if (typeof res['message'] === 'string') {
          errorMessage = res['message'];
        }
      }
    }

    response.status(status).json({
      header: {
        resultCode: 1,
        error: errorMessage,
      },
    });
  }
}
