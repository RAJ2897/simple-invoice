import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './database.config.js';

// Used by the TypeORM CLI and the seed script (outside of the Nest container).
export const AppDataSource = new DataSource(buildDataSourceOptions());
