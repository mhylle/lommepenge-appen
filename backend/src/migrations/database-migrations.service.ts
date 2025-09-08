import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseMigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseMigrationService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    await this.runMigrations();
  }

  private async runMigrations() {
    try {
      // Check if migrations table exists, create if not
      await this.ensureMigrationsTable();

      // Run individual migrations
      await this.migration001_InitialSchema();
      await this.migration002_AddIndexes();
      await this.migration003_AddDefaultData();

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Database migration failed:', error);
      throw error;
    }
  }

  private async ensureMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.dataSource.query(query);
  }

  private async migration001_InitialSchema() {
    const migrationName = 'migration001_InitialSchema';
    
    if (await this.isMigrationExecuted(migrationName)) {
      this.logger.log(`Migration ${migrationName} already executed, skipping`);
      return;
    }

    // TypeORM will automatically create tables due to synchronize: true
    // This migration is just for tracking purposes
    this.logger.log('Initial schema created by TypeORM synchronization');
    
    await this.markMigrationExecuted(migrationName);
  }

  private async migration002_AddIndexes() {
    const migrationName = 'migration002_AddIndexes';
    
    if (await this.isMigrationExecuted(migrationName)) {
      this.logger.log(`Migration ${migrationName} already executed, skipping`);
      return;
    }

    // Additional indexes for performance
    const queries = [
      // Performance indexes for common queries
      'CREATE INDEX IF NOT EXISTS idx_families_parent_active ON families(parent_user_id, "isActive");',
      'CREATE INDEX IF NOT EXISTS idx_pocket_money_users_family_active ON pocket_money_users(family_id, "is_active");',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);',
      'CREATE INDEX IF NOT EXISTS idx_transactions_family_type ON transactions(family_id, type);',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON transactions(status, transaction_date);',
    ];

    for (const query of queries) {
      await this.dataSource.query(query);
    }

    this.logger.log('Additional performance indexes created');
    await this.markMigrationExecuted(migrationName);
  }

  private async migration003_AddDefaultData() {
    const migrationName = 'migration003_AddDefaultData';
    
    if (await this.isMigrationExecuted(migrationName)) {
      this.logger.log(`Migration ${migrationName} already executed, skipping`);
      return;
    }

    // Add any default data if needed
    this.logger.log('Default data setup completed');
    await this.markMigrationExecuted(migrationName);
  }

  private async isMigrationExecuted(migrationName: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM migrations WHERE name = $1',
      [migrationName]
    );
    return parseInt(result[0].count) > 0;
  }

  private async markMigrationExecuted(migrationName: string): Promise<void> {
    await this.dataSource.query(
      'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [migrationName]
    );
  }
}