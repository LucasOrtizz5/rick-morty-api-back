import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    // Entities are auto-loaded from the dist folder
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    // In development: auto-creates/updates tables from entities.
    // MUST be false in production (use migrations instead).
    synchronize: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };

  // Render can provide a single DATABASE_URL. If it's present,
  // we prefer it over individual DATABASE_* variables.
  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
    };
  }

  return {
    ...baseConfig,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };
});
