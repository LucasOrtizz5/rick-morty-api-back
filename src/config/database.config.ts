import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;
  const shouldSynchronize =
    process.env.DB_SYNCHRONIZE === 'true' || !isProduction;

  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    // Las entidades se cargan automáticamente desde la carpeta dist.
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    // En desarrollo queda activado por defecto.
    // En Render se puede habilitar explícitamente con DB_SYNCHRONIZE=true
    // hasta que se agreguen migraciones formales.
    synchronize: shouldSynchronize,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };

  // Render puede entregar una sola DATABASE_URL. Si existe,
  // se prioriza sobre las variables individuales DATABASE_*.
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
