import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parsea las cookies para que la cookie JWT httpOnly sea accesible en controladores y estrategias.
  app.use(cookieParser());

  // CORS: permite que el frontend Angular (Vercel) envíe credenciales (cookies).
  // En producción, CORS_ORIGIN debe apuntar a la URL real del deploy en Vercel.
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Pipe global de validación: valida automáticamente todos los DTO de entrada con class-validator.
  // whitelist: true elimina propiedades no definidas en el DTO por seguridad.
  // forbidNonWhitelisted: true lanza un error si se envían propiedades desconocidas.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de excepciones: normaliza todos los errores al formato { header: { resultCode, error } }.
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
void bootstrap();
