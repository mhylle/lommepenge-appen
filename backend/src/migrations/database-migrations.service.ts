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

    // Create all required tables if they don't exist
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      
      // Families table
      `CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        parent_user_id TEXT NOT NULL,
        profile_picture TEXT,
        "isActive" BOOLEAN DEFAULT 1,
        currency TEXT DEFAULT 'DKK',
        default_allowance DECIMAL(10,2) DEFAULT 0,
        allowance_frequency TEXT DEFAULT 'weekly',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_user_id) REFERENCES users(id)
      );`,
      
      // Pocket Money Users table
      `CREATE TABLE IF NOT EXISTS pocket_money_users (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        auth_user_id TEXT,
        name TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'child',
        current_balance DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families(id),
        FOREIGN KEY (auth_user_id) REFERENCES users(id)
      );`,
      
      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        family_id TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'COMPLETED',
        description TEXT NOT NULL,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        balance_after DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES pocket_money_users(id),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );`
    ];

    for (const query of queries) {
      await this.dataSource.query(query);
    }

    this.logger.log('Initial schema created successfully');
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