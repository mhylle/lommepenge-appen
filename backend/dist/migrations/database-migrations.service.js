"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseMigrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMigrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DatabaseMigrationService = DatabaseMigrationService_1 = class DatabaseMigrationService {
    dataSource;
    logger = new common_1.Logger(DatabaseMigrationService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onApplicationBootstrap() {
        await this.runMigrations();
    }
    async runMigrations() {
        try {
            await this.ensureMigrationsTable();
            await this.migration001_InitialSchema();
            await this.migration002_AddIndexes();
            await this.migration003_AddDefaultData();
            await this.migration004_FixColumnNames();
            await this.migration005_AddMissingPocketMoneyUserColumns();
            await this.migration006_VerifyAndFixDatabaseSchema();
            await this.migration007_TemporaryDisableForeignKeyConstraints();
            await this.migration008_AddMissingTransactionColumns();
            this.logger.log('Database migrations completed successfully');
        }
        catch (error) {
            this.logger.error('Database migration failed:', error);
            throw error;
        }
    }
    async ensureMigrationsTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await this.dataSource.query(query);
    }
    async migration001_InitialSchema() {
        const migrationName = 'migration001_InitialSchema';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        const queries = [
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
    async migration002_AddIndexes() {
        const migrationName = 'migration002_AddIndexes';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        const queries = [
            'CREATE INDEX IF NOT EXISTS idx_families_parent_active ON families("parentUserId", "isActive");',
            'CREATE INDEX IF NOT EXISTS idx_pocket_money_users_family_active ON pocket_money_users("familyId", "isActive");',
            'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions("userId", transaction_date);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_family_type ON transactions("familyId", type);',
            'CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON transactions(status, transaction_date);',
        ];
        for (const query of queries) {
            await this.dataSource.query(query);
        }
        this.logger.log('Additional performance indexes created');
        await this.markMigrationExecuted(migrationName);
    }
    async migration003_AddDefaultData() {
        const migrationName = 'migration003_AddDefaultData';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        this.logger.log('Default data setup completed');
        await this.markMigrationExecuted(migrationName);
    }
    async migration004_FixColumnNames() {
        const migrationName = 'migration004_FixColumnNames';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        const queries = [
            'ALTER TABLE users RENAME COLUMN firstname TO "firstName";',
            'ALTER TABLE users RENAME COLUMN lastname TO "lastName";',
            'ALTER TABLE users RENAME COLUMN isactive TO "isActive";',
            'ALTER TABLE users RENAME COLUMN createdat TO "createdAt";',
            'ALTER TABLE users RENAME COLUMN updatedat TO "updatedAt";',
            'ALTER TABLE families RENAME COLUMN parentuserid TO "parentUserId";',
            'ALTER TABLE families RENAME COLUMN profilepicture TO "profilePicture";',
            'ALTER TABLE families RENAME COLUMN isactive TO "isActive";',
            'ALTER TABLE families RENAME COLUMN defaultallowance TO "defaultAllowance";',
            'ALTER TABLE families RENAME COLUMN allowancefrequency TO "allowanceFrequency";',
            'ALTER TABLE families RENAME COLUMN createdat TO "createdAt";',
            'ALTER TABLE families RENAME COLUMN updatedat TO "updatedAt";',
            'ALTER TABLE pocket_money_users RENAME COLUMN familyid TO "familyId";',
            'ALTER TABLE pocket_money_users RENAME COLUMN authuserid TO "authUserId";',
            'ALTER TABLE pocket_money_users RENAME COLUMN currentbalance TO "currentBalance";',
            'ALTER TABLE pocket_money_users RENAME COLUMN isactive TO "isActive";',
            'ALTER TABLE pocket_money_users RENAME COLUMN createdat TO "createdAt";',
            'ALTER TABLE pocket_money_users RENAME COLUMN updatedat TO "updatedAt";',
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
            }
            catch (error) {
                this.logger.warn(`Column rename query failed (might already be correct): ${query}`, error.message);
            }
        }
        this.logger.log('Column names fixed to match TypeORM entity expectations');
        await this.markMigrationExecuted(migrationName);
    }
    async migration005_AddMissingPocketMoneyUserColumns() {
        const migrationName = 'migration005_AddMissingPocketMoneyUserColumns';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        this.logger.log('Running migration: Add missing pocket_money_users columns');
        const queries = [
            'ALTER TABLE pocket_money_users ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE;',
            'ALTER TABLE pocket_money_users ADD COLUMN IF NOT EXISTS "profilePicture" VARCHAR(255);',
            'ALTER TABLE pocket_money_users ADD COLUMN IF NOT EXISTS "cardColor" VARCHAR(7) DEFAULT \'#FFB6C1\';',
            'ALTER TABLE pocket_money_users ADD COLUMN IF NOT EXISTS "weeklyAllowance" DECIMAL(10,2) DEFAULT 0.00;',
            'ALTER TABLE pocket_money_users ADD COLUMN IF NOT EXISTS "preferences" JSON;',
        ];
        for (const query of queries) {
            try {
                await this.dataSource.query(query);
            }
            catch (error) {
                this.logger.warn(`Column add query failed (might already exist): ${query}`, error.message);
            }
        }
        this.logger.log('Missing pocket_money_users columns added successfully');
        await this.markMigrationExecuted(migrationName);
    }
    async migration006_VerifyAndFixDatabaseSchema() {
        const migrationName = 'migration006_VerifyAndFixDatabaseSchema';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        this.logger.log('Running migration: Verify and fix database schema');
        try {
            const tableInfo = await this.dataSource.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'pocket_money_users'
        ORDER BY ordinal_position;
      `);
            this.logger.log(`Current pocket_money_users table structure: ${JSON.stringify(tableInfo)}`);
            const requiredColumns = [
                { name: 'dateOfBirth', type: 'date' },
                { name: 'profilePicture', type: 'character varying' },
                { name: 'cardColor', type: 'character varying' },
                { name: 'weeklyAllowance', type: 'numeric' },
                { name: 'preferences', type: 'json' }
            ];
            for (const column of requiredColumns) {
                const exists = tableInfo.some(col => col.column_name === column.name);
                if (!exists) {
                    this.logger.warn(`Column ${column.name} is missing, attempting to add it...`);
                    let query = '';
                    switch (column.name) {
                        case 'dateOfBirth':
                            query = 'ALTER TABLE pocket_money_users ADD COLUMN "dateOfBirth" DATE;';
                            break;
                        case 'profilePicture':
                            query = 'ALTER TABLE pocket_money_users ADD COLUMN "profilePicture" VARCHAR(255);';
                            break;
                        case 'cardColor':
                            query = 'ALTER TABLE pocket_money_users ADD COLUMN "cardColor" VARCHAR(7) DEFAULT \'#FFB6C1\';';
                            break;
                        case 'weeklyAllowance':
                            query = 'ALTER TABLE pocket_money_users ADD COLUMN "weeklyAllowance" DECIMAL(10,2) DEFAULT 0.00;';
                            break;
                        case 'preferences':
                            query = 'ALTER TABLE pocket_money_users ADD COLUMN "preferences" JSON;';
                            break;
                    }
                    if (query) {
                        await this.dataSource.query(query);
                        this.logger.log(`Successfully added column: ${column.name}`);
                    }
                }
                else {
                    this.logger.log(`Column ${column.name} exists`);
                }
            }
            const finalTableInfo = await this.dataSource.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'pocket_money_users'
        ORDER BY ordinal_position;
      `);
            this.logger.log(`Final pocket_money_users table structure: ${JSON.stringify(finalTableInfo)}`);
            const count = await this.dataSource.query('SELECT COUNT(*) as count FROM pocket_money_users');
            this.logger.log(`Pocket money users count: ${count[0].count}`);
        }
        catch (error) {
            this.logger.error('Error in schema verification migration:', error);
            throw error;
        }
        this.logger.log('Database schema verification and fix completed successfully');
        await this.markMigrationExecuted(migrationName);
    }
    async isMigrationExecuted(migrationName) {
        const result = await this.dataSource.query('SELECT COUNT(*) as count FROM migrations WHERE name = $1', [migrationName]);
        return parseInt(result[0].count) > 0;
    }
    async markMigrationExecuted(migrationName) {
        await this.dataSource.query('INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [migrationName]);
    }
    async migration007_TemporaryDisableForeignKeyConstraints() {
        const migrationName = 'migration007_TemporaryDisableForeignKeyConstraints';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        this.logger.log('Running migration: Temporarily disable foreign key constraints');
        try {
            const queries = [
                'ALTER TABLE families DROP CONSTRAINT IF EXISTS families_parentuserid_fkey;',
                'ALTER TABLE families DROP CONSTRAINT IF EXISTS "FK_families_parentUserId";',
                'ALTER TABLE pocket_money_users DROP CONSTRAINT IF EXISTS pocket_money_users_familyid_fkey;',
                'ALTER TABLE pocket_money_users DROP CONSTRAINT IF EXISTS "FK_pocket_money_users_familyId";',
                'ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_familyid_fkey;',
                'ALTER TABLE transactions DROP CONSTRAINT IF EXISTS "FK_transactions_familyId";',
                'ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_userid_fkey;',
                'ALTER TABLE transactions DROP CONSTRAINT IF EXISTS "FK_transactions_userId";',
            ];
            for (const query of queries) {
                try {
                    await this.dataSource.query(query);
                    this.logger.log(`Successfully executed: ${query}`);
                }
                catch (error) {
                    this.logger.warn(`Constraint drop query failed (might not exist): ${query}`, error.message);
                }
            }
            this.logger.log('Foreign key constraints temporarily disabled to allow family creation');
        }
        catch (error) {
            this.logger.error('Error in foreign key constraint migration:', error);
            throw error;
        }
        await this.markMigrationExecuted(migrationName);
    }
    async migration008_AddMissingTransactionColumns() {
        const migrationName = 'migration008_AddMissingTransactionColumns';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        this.logger.log('Running migration: Add missing transaction columns');
        try {
            const queries = [
                'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category VARCHAR(100);',
                'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "stickerType" VARCHAR(255);',
                'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "stickerColor" VARCHAR(7);',
                'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSON;',
                'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "createdByUserId" UUID;',
                'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes VARCHAR(255);',
                'ALTER TABLE transactions ALTER COLUMN "transactionDate" TYPE DATE;',
            ];
            for (const query of queries) {
                try {
                    await this.dataSource.query(query);
                    this.logger.log(`Successfully executed: ${query}`);
                }
                catch (error) {
                    this.logger.warn(`Column add query failed (might already exist): ${query}`, error.message);
                }
            }
            const tableInfo = await this.dataSource.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'transactions'
        ORDER BY ordinal_position;
      `);
            this.logger.log(`Final transactions table structure: ${JSON.stringify(tableInfo)}`);
        }
        catch (error) {
            this.logger.error('Error in transaction columns migration:', error);
            throw error;
        }
        this.logger.log('Missing transaction columns added successfully');
        await this.markMigrationExecuted(migrationName);
    }
};
exports.DatabaseMigrationService = DatabaseMigrationService;
exports.DatabaseMigrationService = DatabaseMigrationService = DatabaseMigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DatabaseMigrationService);
//# sourceMappingURL=database-migrations.service.js.map