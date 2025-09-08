import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseMigrationService } from './database-migrations.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [DatabaseMigrationService],
  exports: [DatabaseMigrationService],
})
export class MigrationsModule {}