import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Every error leaves the API as `{ statusCode, message, error }`.
 * Unexpected errors are logged and reported as a generic 500 so internals
 * (SQL, stack traces) never reach the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong on our side. Please try again.',
        error: 'Internal Server Error',
      };
    }

    const statusCode = exception.getStatus();
    const error = STATUS_CODES[statusCode] ?? 'Error';
    const res = exception.getResponse();

    if (typeof res === 'string') {
      return { statusCode, message: res, error };
    }

    const { message } = res as { message?: string | string[] };
    return { statusCode, message: message ?? exception.message, error };
  }
}
