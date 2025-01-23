import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  // Hassas bilgileri içeren alanları filtrele
  private filterSensitiveData(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'credit_card'];
    const filtered = { ...body };

    Object.keys(filtered).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        filtered[key] = '***FILTERED***';
      } else if (typeof filtered[key] === 'object') {
        filtered[key] = this.filterSensitiveData(filtered[key]);
      }
    });

    return filtered;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Request body'sini güvenli bir şekilde al ve hassas bilgileri filtrele
    const requestBody = request.body ? this.filterSensitiveData(request.body) : undefined;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    // Log context'ini hazırla
    const logContext = {
      requestBody,
      query: request.query,
      params: request.params,
      headers: this.filterSensitiveData(request.headers),
      ...(request.user && { user: { id: request.user.id, email: request.user.email } })
    };

    // Log mesajını oluştur
    const logMessage = `${request.method} ${request.url} ${status} - Error: ${message}`;

    // Log based on status code
    if (status >= 500) {
      this.logger.error(
        logMessage,
        {
          exception: exception instanceof Error ? exception.stack : '',
          context: logContext
        },
        'HttpException'
      );
    } else if (status >= 400) {
      this.logger.warn(
        logMessage,
        {
          context: logContext
        },
        'HttpException'
      );
    } else {
      this.logger.log(
        logMessage,
        {
          context: logContext
        },
        'HttpException'
      );
    }

    response
      .status(status)
      .json(errorResponse);
  }
} 