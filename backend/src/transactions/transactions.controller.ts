import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../dto/transaction.dto';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return await this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('familyId') familyId?: string,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
  ): Promise<Transaction[]> {
    if (userId) {
      return await this.transactionsService.findByUserId(userId);
    }
    if (familyId) {
      return await this.transactionsService.findByFamilyId(familyId);
    }
    if (type) {
      return await this.transactionsService.findByType(type);
    }
    if (status) {
      return await this.transactionsService.findByStatus(status);
    }
    return await this.transactionsService.findAll();
  }

  @Get('stats/:userId')
  async getStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.transactionsService.getTransactionStatsByUserId(userId);
  }

  @Get('child/:userId')
  async getChildTransactions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit?: string,
  ): Promise<Transaction[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const transactions = await this.transactionsService.findByUserId(userId);
    return limitNumber ? transactions.slice(0, limitNumber) : transactions;
  }

  @Get('by-user/:userId')
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Transaction[]> {
    return await this.transactionsService.findByUserId(userId);
  }

  @Get('by-family/:familyId')
  async findByFamilyId(@Param('familyId', ParseUUIDPipe) familyId: string): Promise<Transaction[]> {
    return await this.transactionsService.findByFamilyId(familyId);
  }

  @Get('by-type/:type')
  async findByType(
    @Param('type', new ParseEnumPipe(TransactionType)) type: TransactionType,
  ): Promise<Transaction[]> {
    return await this.transactionsService.findByType(type);
  }

  @Get('by-status/:status')
  async findByStatus(
    @Param('status', new ParseEnumPipe(TransactionStatus)) status: TransactionStatus,
  ): Promise<Transaction[]> {
    return await this.transactionsService.findByStatus(status);
  }

  @Get('date-range/:userId')
  async findByDateRange(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Transaction[]> {
    return await this.transactionsService.findByUserIdAndDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('family-stats/:familyId')
  async getFamilyStats(@Param('familyId', ParseUUIDPipe) familyId: string) {
    return await this.transactionsService.getFamilyStatistics(familyId);
  }

  @Get('recent/:familyId')
  async getRecentTransactions(
    @Param('familyId', ParseUUIDPipe) familyId: string,
    @Query('limit') limit?: string,
  ): Promise<Transaction[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return await this.transactionsService.getRecentTransactionsByFamilyId(familyId, limitNumber);
  }

  @Get('family-paginated/:familyId')
  async getFamilyTransactionsPaginated(
    @Param('familyId', ParseUUIDPipe) familyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return await this.transactionsService.findByFamilyIdWithPagination(familyId, pageNumber, limitNumber);
  }

  @Get('last-activity/:userId')
  async getLastActivity(@Param('userId', ParseUUIDPipe) userId: string) {
    const activity = await this.transactionsService.getLastActivityByUserId(userId);
    return { lastActivity: activity };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
    return await this.transactionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return await this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.transactionsService.remove(id);
  }
}