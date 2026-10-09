import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions, ThrottlerOptions } from './throttler-module-options.interface';
import { ThrottlerStorage } from './throttler-storage.interface';
import { ThrottlerLimitDetail, ThrottlerRequest } from './throttler.guard.interface';
export declare class ThrottlerGuard implements CanActivate {
    protected readonly options: ThrottlerModuleOptions;
    protected readonly storageService: ThrottlerStorage;
    protected readonly reflector: Reflector;
    protected headerPrefix: string;
    protected logger: Logger;
    protected errorMessage: string;
    protected throttlers: Array<ThrottlerOptions>;
    protected commonOptions: Pick<ThrottlerOptions, 'skipIf' | 'ignoreUserAgents' | 'getTracker' | 'generateKey' | 'setHeaders'>;
    protected ipv6SubnetPrefix: number;
    constructor(options: ThrottlerModuleOptions, storageService: ThrottlerStorage, reflector: Reflector);
    onModuleInit(): Promise<void>;
    canActivate(context: ExecutionContext): Promise<boolean>;
    protected shouldSkip(_context: ExecutionContext): Promise<boolean>;
    protected handleRequest(requestProps: ThrottlerRequest): Promise<boolean>;
    protected getTracker(req: Record<string, any>): Promise<string>;
    protected setResponseHeader(res: Record<string, any>, name: string, value: string | number): void;
    protected getRequestResponse(context: ExecutionContext): {
        req: Record<string, any>;
        res: Record<string, any>;
    };
    protected generateKey(context: ExecutionContext, suffix: string, name: string): string;
    protected throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void>;
    protected getErrorMessage(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<string>;
    private toNumber;
    private resolveValue;
}
