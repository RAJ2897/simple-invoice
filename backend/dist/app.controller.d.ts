import { DataSource } from 'typeorm';
export declare class AppController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    health(): Promise<{
        status: string;
        database: string;
    }>;
}
