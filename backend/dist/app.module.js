var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { envValidationSchema } from './config/env.validation.js';
import { buildDataSourceOptions } from './database/database.config.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { UsersModule } from './users/users.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: envValidationSchema,
            }),
            TypeOrmModule.forRootAsync({
                inject: [ConfigService],
                useFactory: () => ({
                    ...buildDataSourceOptions(process.env),
                    migrationsRun: true,
                }),
            }),
            ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]),
            UsersModule,
            AuthModule,
            InvoicesModule,
        ],
        controllers: [AppController],
        providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map