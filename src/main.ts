import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies so httpOnly JWT cookie is accessible in controllers/strategies
  app.use(cookieParser());

  // CORS: allow the Angular frontend (Vercel) to send credentials (cookies).
  // In production, CORS_ORIGIN must be set to the actual Vercel deployment URL.
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe: automatically validates all incoming DTOs using class-validator.
  // whitelist: true strips any properties not defined in the DTO (security).
  // forbidNonWhitelisted: true throws an error if unknown properties are sent.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter: normalizes all errors to { header: { resultCode, error } }
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
void bootstrap();
