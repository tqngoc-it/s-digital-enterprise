import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. Cho phép Frontend Next.js gọi API (Tránh lỗi CORS)
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Định dạng tiền tố API chuẩn: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // 3. Tự động validate dữ liệu Request Body qua DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 S-Digital Backend đang chạy tại: http://localhost:${port}/api/v1`);
}
bootstrap();