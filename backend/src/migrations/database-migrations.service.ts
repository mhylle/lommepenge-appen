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
      await this.migration004_FixColumnNames();

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Database migration failed:', error);
      throw error;
    }
  }

  private async ensureMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        apps TEXT DEFAULT '[]',
        roles TEXT DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      // Families table
      `CREATE TABLE IF NOT EXISTS families (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "parentUserId" UUID NOT NULL,
        "profilePicture" VARCHAR(500),
        "isActive" BOOLEAN DEFAULT true,
        currency VARCHAR(10) DEFAULT 'DKK',
        "defaultAllowance" DECIMAL(10,2) DEFAULT 0,
        "allowanceFrequency" VARCHAR(50) DEFAULT 'weekly',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("parentUserId") REFERENCES users(id)
      );`,
      
      // Pocket Money Users table
      `CREATE TABLE IF NOT EXISTS pocket_money_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "familyId" UUID NOT NULL,
        "authUserId" UUID,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'child',
        "currentBalance" DECIMAL(10,2) DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("familyId") REFERENCES families(id),
        FOREIGN KEY ("authUserId") REFERENCES users(id)
      );`,
      
      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "familyId" UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'COMPLETED',
        description TEXT NOT NULL,
        "transactionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "balanceAfter" DECIMAL(10,2),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES pocket_money_users(id),
        FOREIGN KEY ("familyId") REFERENCES families(id)
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
      'CREATE INDEX IF NOT EXISTS idx_families_parent_active ON families("parentUserId", "isActive");',
      'CREATE INDEX IF NOT EXISTS idx_pocket_money_users_family_active ON pocket_money_users("familyId", "isActive");',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions("userId", "transactionDate");',
      'CREATE INDEX IF NOT EXISTS idx_transactions_family_type ON transactions("familyId", type);',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON transactions(status, "transactionDate");',
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

  private async migration004_FixColumnNames() {
    const migrationName = 'migration004_FixColumnNames';
    
    if (await this.isMigrationExecuted(migrationName)) {
      this.logger.log(`Migration ${migrationName} already executed, skipping`);
      return;
    }

    // Fix column names to match TypeORM entity expectations
    const queries = [
      // Rename columns in users table
      'ALTER TABLE users RENAME COLUMN firstname TO "firstName";',
      'ALTER TABLE users RENAME COLUMN lastname TO "lastName";',
      'ALTER TABLE users RENAME COLUMN isactive TO "isActive";',
      'ALTER TABLE users RENAME COLUMN createdat TO "createdAt";',
      'ALTER TABLE users RENAME COLUMN updatedat TO "updatedAt";',
      
      // Fix families table column names
      'ALTER TABLE families RENAME COLUMN parentuserid TO "parentUserId";',
      'ALTER TABLE families RENAME COLUMN profilepicture TO "profilePicture";',
      'ALTER TABLE families RENAME COLUMN isactive TO "isActive";',
      'ALTER TABLE families RENAME COLUMN defaultallowance TO "defaultAllowance";',
      'ALTER TABLE families RENAME COLUMN allowancefrequency TO "allowanceFrequency";',
      'ALTER TABLE families RENAME COLUMN createdat TO "createdAt";',
      'ALTER TABLE families RENAME COLUMN updatedat TO "updatedAt";',
      
      // Fix pocket_money_users table column names
      'ALTER TABLE pocket_money_users RENAME COLUMN familyid TO "familyId";',
      'ALTER TABLE pocket_money_users RENAME COLUMN authuserid TO "authUserId";',
      'ALTER TABLE pocket_money_users RENAME COLUMN currentbalance TO "currentBalance";',
      'ALTER TABLE pocket_money_users RENAME COLUMN isactive TO "isActive";',
      'ALTER TABLE pocket_money_users RENAME COLUMN createdat TO "createdAt";',
      'ALTER TABLE pocket_money_users RENAME COLUMN updatedat TO "updatedAt";',
      
      // Fix transactions table column names
      'ALTER TABLE transactions RENAME COLUMN userid TO "userId";',
      'ALTER TABLE transactions RENAME COLUMN familyid TO "familyId";',
      'ALTER TABLE transactions RENAME COLUMN transactiondate TO "transactionDate";',
      'ALTER TABLE transactions RENAME COLUMN balanceafter TO "balanceAfter";',
      'ALTER TABLE transactions RENAME COLUMN createdat TO "createdAt";',
      'ALTER TABLE transactions RENAME COLUMN updatedat TO "updatedAt";',
    ];

    for (const query of queries) {
      try {
        await this.dataSource.query(query);
      } catch (error) {
        // Log but don't fail if column already has correct name
        this.logger.warn(`Column rename query failed (might already be correct): ${query}`, error.message);
      }
    }

    this.logger.log('Column names fixed to match TypeORM entity expectations');
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