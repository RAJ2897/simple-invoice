import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './database.config.js';
export const AppDataSource = new DataSource(buildDataSourceOptions());
//# sourceMappingURL=data-source.js.map