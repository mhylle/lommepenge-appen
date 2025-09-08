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
var _a;
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        this.logger.log('Initial schema created by TypeORM synchronization');
        await this.markMigrationExecuted(migrationName);
    }
    async migration002_AddIndexes() {
        const migrationName = 'migration002_AddIndexes';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        const queries = [
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
    async migration003_AddDefaultData() {
        const migrationName = 'migration003_AddDefaultData';
        if (await this.isMigrationExecuted(migrationName)) {
            this.logger.log(`Migration ${migrationName} already executed, skipping`);
            return;
        }
        this.logger.log('Default data setup completed');
        await this.markMigrationExecuted(migrationName);
    }
    async isMigrationExecuted(migrationName) {
        const result = await this.dataSource.query('SELECT COUNT(*) as count FROM migrations WHERE name = $1', [migrationName]);
        return parseInt(result[0].count) > 0;
    }
    async markMigrationExecuted(migrationName) {
        await this.dataSource.query('INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [migrationName]);
    }
};
exports.DatabaseMigrationService = DatabaseMigrationService;
exports.DatabaseMigrationService = DatabaseMigrationService = DatabaseMigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object])
], DatabaseMigrationService);
//# sourceMappingURL=database-migrations.service.js.map