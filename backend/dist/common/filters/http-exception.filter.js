var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const body = this.toBody(exception);
        if (body.statusCode >= 500) {
            this.logger.error(exception instanceof Error ? exception.stack : String(exception));
        }
        response.status(body.statusCode).json(body);
    }
    toBody(exception) {
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
        const { message } = res;
        return { statusCode, message: message ?? exception.message, error };
    }
};
AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    Catch()
], AllExceptionsFilter);
export { AllExceptionsFilter };
//# sourceMappingURL=http-exception.filter.js.map