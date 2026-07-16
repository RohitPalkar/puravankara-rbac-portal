"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const app_logger_1 = require("./common/logger/app-logger");
async function bootstrap() {
    const logger = new app_logger_1.AppLogger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(logger);
    app.setGlobalPrefix('api/v1');
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
        : process.env.FRONTEND_URL
            ? [process.env.FRONTEND_URL]
            : [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:8081',
            ];
    app.enableCors({
        origin: corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Puravankara RBAC API V3')
        .setDescription('Enterprise RBAC + ABAC + Workflow + Audit')
        .setVersion('3.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/v1/docs', app, document);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Backend running on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/api/v1/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map