import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp, setupSwagger } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  configureApp(app);
  setupSwagger(app);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(
    `API ready on http://localhost:${port} (docs at /api/docs)`,
    'Bootstrap',
  );
}
await bootstrap();
