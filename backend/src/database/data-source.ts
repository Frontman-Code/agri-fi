import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const databaseReplicaUrl = process.env.DATABASE_REPLICA_URL;

const masterConnection = databaseUrl 
  ? { url: databaseUrl }
  : {
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
      database: process.env.DATABASE_NAME ?? 'agric_onchain',
    };

const slaveConnection = databaseReplicaUrl
  ? { url: databaseReplicaUrl }
  : {
      host: process.env.DATABASE_REPLICA_HOST ?? process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
      database: process.env.DATABASE_NAME ?? 'agric_onchain',
    };

const dataSourceConfig: any = {
  type: 'postgres',
  replication: {
    master: masterConnection,
    slaves: [slaveConnection],
  },
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(dataSourceConfig);
