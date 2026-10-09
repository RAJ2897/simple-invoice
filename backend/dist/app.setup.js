import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
export function configureApp(app) {
    const config = app.get(ConfigService);
    app.use(helmet());
    app.enableCors({
        origin: config
            .get('CORS_ORIGIN', 'http://localhost:5173')
            .split(',')
            .map((origin) => origin.trim()),
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
    }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableShutdownHooks();
}
export function setupSwagger(app) {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder()
        .setTitle('Simple-Invoice API')
        .setDescription('REST API behind the Simple-Invoice web app. Sign in through `POST /auth/login`, ' +
        'then click **Authorize** and paste the `accessToken`.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build());
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
}
//# sourceMappingURL=app.setup.js.map