"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerStorageService = exports.DEFAULT_SWEEP_INTERVAL = void 0;
const common_1 = require("@nestjs/common");
const async_hooks_1 = require("async_hooks");
exports.DEFAULT_SWEEP_INTERVAL = 60000;
let ThrottlerStorageService = class ThrottlerStorageService {
    constructor() {
        this._storage = new Map();
        this.hitExpirations = new Map();
        this.sweepIntervalMs = exports.DEFAULT_SWEEP_INTERVAL;
        this.startSweep = async_hooks_1.AsyncResource.bind(() => {
            var _a, _b;
            this.sweepInterval = setInterval(() => this.evictIdleRecords(), this.sweepIntervalMs);
            (_b = (_a = this.sweepInterval).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
        });
    }
    ensureSweep() {
        if (this.sweepInterval) {
            return;
        }
        this.startSweep();
    }
    get storage() {
        return this._storage;
    }
    evictIdleRecords(now = Date.now()) {
        for (const [key, record] of this._storage) {
            if (record.isBlocked && record.blockExpiresAt > now) {
                continue;
            }
            if (record.expiresAt > now) {
                continue;
            }
            if (this.hasLiveHits(key, now)) {
                continue;
            }
            this.hitExpirations.delete(key);
            this._storage.delete(key);
        }
    }
    hasLiveHits(key, now) {
        const expirations = this.hitExpirations.get(key);
        if (!expirations) {
            return false;
        }
        for (const hits of expirations.values()) {
            if (hits.some((expiresAt) => expiresAt > now)) {
                return true;
            }
        }
        return false;
    }
    getHitExpirations(key, throttlerName) {
        let expirations = this.hitExpirations.get(key);
        if (!expirations) {
            expirations = new Map();
            this.hitExpirations.set(key, expirations);
        }
        let hits = expirations.get(throttlerName);
        if (!hits) {
            hits = [];
            expirations.set(throttlerName, hits);
        }
        return hits;
    }
    pruneExpiredHits(key, throttlerName, now = Date.now()) {
        const hits = this.getHitExpirations(key, throttlerName).filter((expiresAt) => expiresAt > now);
        this.hitExpirations.get(key).set(throttlerName, hits);
        this.storage.get(key).totalHits.set(throttlerName, hits.length);
    }
    getExpirationTime(key) {
        return Math.ceil((this.storage.get(key).expiresAt - Date.now()) / 1000);
    }
    getBlockExpirationTime(key) {
        return Math.ceil((this.storage.get(key).blockExpiresAt - Date.now()) / 1000);
    }
    resetBlockedRequest(key, throttlerName) {
        this.storage.get(key).isBlocked = false;
        this.storage.get(key).totalHits.set(throttlerName, 0);
        this.hitExpirations.get(key).set(throttlerName, []);
    }
    fireHitCount(key, throttlerName, ttl) {
        const { totalHits } = this.storage.get(key);
        totalHits.set(throttlerName, totalHits.get(throttlerName) + 1);
        this.getHitExpirations(key, throttlerName).push(Date.now() + ttl);
    }
    incrementWithoutBlock(key, ttlMilliseconds, limit, throttlerName, timeToExpire) {
        const { totalHits } = this.storage.get(key);
        const isBlocked = totalHits.get(throttlerName) >= limit;
        if (!isBlocked) {
            this.fireHitCount(key, throttlerName, ttlMilliseconds);
        }
        const hits = this.getHitExpirations(key, throttlerName);
        const timeToBlockExpire = hits.length
            ? Math.ceil((Math.min(...hits) - Date.now()) / 1000)
            : timeToExpire;
        return {
            totalHits: totalHits.get(throttlerName) + (isBlocked ? 1 : 0),
            timeToExpire,
            isBlocked,
            timeToBlockExpire: isBlocked ? timeToBlockExpire : 0,
        };
    }
    async increment(key, ttl, limit, blockDuration, throttlerName) {
        const ttlMilliseconds = ttl;
        const blockDurationMilliseconds = blockDuration;
        this.ensureSweep();
        if (!this.storage.has(key)) {
            this.storage.set(key, {
                totalHits: new Map([[throttlerName, 0]]),
                expiresAt: Date.now() + ttlMilliseconds,
                blockExpiresAt: 0,
                isBlocked: false,
            });
        }
        this.pruneExpiredHits(key, throttlerName);
        let timeToExpire = this.getExpirationTime(key);
        if (timeToExpire <= 0) {
            this.storage.get(key).expiresAt = Date.now() + ttlMilliseconds;
            timeToExpire = this.getExpirationTime(key);
        }
        if (blockDurationMilliseconds <= 0) {
            return this.incrementWithoutBlock(key, ttlMilliseconds, limit, throttlerName, timeToExpire);
        }
        if (!this.storage.get(key).isBlocked) {
            this.fireHitCount(key, throttlerName, ttlMilliseconds);
        }
        if (this.storage.get(key).totalHits.get(throttlerName) > limit &&
            !this.storage.get(key).isBlocked) {
            this.storage.get(key).isBlocked = true;
            this.storage.get(key).blockExpiresAt = Date.now() + blockDurationMilliseconds;
        }
        const timeToBlockExpire = this.getBlockExpirationTime(key);
        if (timeToBlockExpire <= 0 && this.storage.get(key).isBlocked) {
            this.resetBlockedRequest(key, throttlerName);
            this.fireHitCount(key, throttlerName, ttlMilliseconds);
        }
        return {
            totalHits: this.storage.get(key).totalHits.get(throttlerName),
            timeToExpire,
            isBlocked: this.storage.get(key).isBlocked,
            timeToBlockExpire: timeToBlockExpire,
        };
    }
    onApplicationShutdown() {
        if (this.sweepInterval) {
            clearInterval(this.sweepInterval);
            this.sweepInterval = undefined;
        }
        this.hitExpirations.clear();
        this._storage.clear();
    }
};
exports.ThrottlerStorageService = ThrottlerStorageService;
exports.ThrottlerStorageService = ThrottlerStorageService = __decorate([
    (0, common_1.Injectable)()
], ThrottlerStorageService);
//# sourceMappingURL=throttler.service.js.map