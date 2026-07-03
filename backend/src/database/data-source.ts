import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { EnvKeys } from '../config/env-keys.enum';

config({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env[EnvKeys.DATABASE_URL],
  ssl: {
    rejectUnauthorized: false, // Required for Supabase / Cloud databases
  },
  synchronize: false, // We use migrations instead of synchronize for safety
  logging: true,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
});
