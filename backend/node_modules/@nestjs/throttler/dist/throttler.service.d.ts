import { OnApplicationShutdown } from '@nestjs/common';
import { ThrottlerStorageOptions } from './throttler-storage-options.interface';
import { ThrottlerStorageRecord } from './throttler-storage-record.interface';
import { ThrottlerStorage } from './throttler-storage.interface';
export declare const DEFAULT_SWEEP_INTERVAL = 60000;
export declare class ThrottlerStorageService implements ThrottlerStorage, OnApplicationShutdown {
    private _storage;
    private hitExpirations;
    private sweepInterval?;
    protected readonly sweepIntervalMs: number;
    private ensureSweep;
    private readonly startSweep;
    get storage(): Map<string, ThrottlerStorageOptions>;
    private evictIdleRecords;
    private hasLiveHits;
    private getHitExpirations;
    private pruneExpiredHits;
    private getExpirationTime;
    private getBlockExpirationTime;
    private resetBlockedRequest;
    private fireHitCount;
    private incrementWithoutBlock;
    increment(key: string, ttl: number, limit: number, blockDuration: number, throttlerName: string): Promise<ThrottlerStorageRecord>;
    onApplicationShutdown(): void;
}
