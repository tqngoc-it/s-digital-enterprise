import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Kích hoạt bảo vệ HTTP Headers bằng Helmet
  app.use(helmet());

  // 1. Cho phép Frontend Next.js gọi API (Tránh lỗi CORS)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://s-digital-vn.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 2. Định dạng tiền tố API chuẩn: /api
  app.setGlobalPrefix('api');

  // 3. Tự động validate dữ liệu Request Body qua DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 S-Digital Backend đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();