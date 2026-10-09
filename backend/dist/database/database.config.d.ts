import type { DataSourceOptions } from 'typeorm';
type Env = Record<string, string | undefined>;
export declare function buildDataSourceOptions(env?: Env): DataSourceOptions;
export {};
