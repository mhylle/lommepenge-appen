import { OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseMigrationService implements OnApplicationBootstrap {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onApplicationBootstrap(): any;
    private runMigrations;
    private ensureMigrationsTable;
    private migration001_InitialSchema;
    private migration002_AddIndexes;
    private migration003_AddDefaultData;
    private isMigrationExecuted;
    private markMigrationExecuted;
}
