import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '../dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(PocketMoneyUser)
    private pocketMoneyUsersRepository: Repository<PocketMoneyUser>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Find the user to update balance
    const user = await this.pocketMoneyUsersRepository.findOne({
      where: { id: createTransactionDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID "${createTransactionDto.userId}" not found`,
      );
    }

    // Ensure createdByUserId is set - default to userId if not provided
    if (!createTransactionDto.createdByUserId) {
      createTransactionDto.createdByUserId = createTransactionDto.userId;
    }

    const transaction =
      this.transactionsRepository.create(createTransactionDto);

    // Calculate balance after transaction
    const newBalance =
      Number(user.currentBalance) + Number(createTransactionDto.amount);
    transaction.balanceAfter = newBalance;

    // Save transaction
    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    // Update user balance
    user.currentBalance = newBalance;
    await this.pocketMoneyUsersRepository.save(user);

    return savedTransaction;
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }

    return transaction;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { userId },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByFamilyId(familyId: string): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { familyId },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByType(type: TransactionType): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { type },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { status },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        } as any,
      },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByFamilyIdWithPagination(
    familyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const [transactions, total] =
      await this.transactionsRepository.findAndCount({
        where: { familyId },
        // relations: ['user', 'family'], // Temporarily removed due to database schema issues
        order: { transactionDate: 'DESC', createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentTransactionsByFamilyId(
    familyId: string,
    limit: number = 5,
  ): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { familyId },
      // relations: ['user', 'family'], // Temporarily removed due to database schema issues
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFamilyStatistics(familyId: string): Promise<{
    totalSaved: number;
    childrenCount: number;
    weeklyAllowance: number;
    transactionsThisMonth: number;
    averageBalance: number;
  }> {
    // Get all family transactions
    const transactions = await this.findByFamilyId(familyId);

    // Get current month's transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTransactions = transactions.filter(
      (t) => new Date(t.transactionDate) >= startOfMonth,
    );

    // Get unique children in family
    const uniqueChildren = new Set(transactions.map((t) => t.userId));
    const childrenCount = uniqueChildren.size;

    // Calculate statistics
    const totalSaved = transactions
      .filter(
        (t) =>
          t.type === TransactionType.SAVINGS &&
          t.status === TransactionStatus.COMPLETED,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const weeklyAllowance =
      transactions
        .filter((t) => t.type === TransactionType.ALLOWANCE)
        .reduce((sum, t) => sum + Number(t.amount), 0) / 4; // Rough weekly estimate

    // Get current balances for average
    const userBalances: { [userId: string]: number } = {};
    for (const userId of uniqueChildren) {
      const user = await this.pocketMoneyUsersRepository.findOne({
        where: { id: userId },
      });
      if (user) {
        userBalances[userId] = Number(user.currentBalance);
      }
    }

    const totalBalance = Object.values(userBalances).reduce(
      (sum, balance) => sum + balance,
      0,
    );
    const averageBalance = childrenCount > 0 ? totalBalance / childrenCount : 0;

    return {
      totalSaved,
      childrenCount,
      weeklyAllowance,
      transactionsThisMonth: thisMonthTransactions.length,
      averageBalance,
    };
  }

  async getLastActivityByUserId(userId: string): Promise<string> {
    const lastTransaction = await this.transactionsRepository.findOne({
      where: { userId, status: TransactionStatus.COMPLETED },
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });

    if (!lastTransaction) {
      return 'Ingen aktivitet endnu';
    }

    const amount = Math.abs(Number(lastTransaction.amount));
    const danishTypes = {
      [TransactionType.ALLOWANCE]: 'Ugepenge',
      [TransactionType.CHORE_REWARD]: 'Belønning',
      [TransactionType.PURCHASE]: 'Køb',
      [TransactionType.SAVINGS]: 'Opsparing',
      [TransactionType.PENALTY]: 'Bøde',
      [TransactionType.BONUS]: 'Bonus',
    };

    const typeName = danishTypes[lastTransaction.type] || lastTransaction.type;

    if (lastTransaction.type === TransactionType.PURCHASE) {
      return `${lastTransaction.description} (${amount} kr.)`;
    } else {
      return `${typeName}: ${amount} kr.`;
    }
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    Object.assign(transaction, updateTransactionDto);
    return await this.transactionsRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);

    // If transaction is completed, we need to reverse the balance change
    if (transaction.status === TransactionStatus.COMPLETED) {
      const user = await this.pocketMoneyUsersRepository.findOne({
        where: { id: transaction.userId },
      });

      if (user) {
        // Reverse the transaction amount from current balance
        user.currentBalance =
          Number(user.currentBalance) - Number(transaction.amount);
        await this.pocketMoneyUsersRepository.save(user);
      }
    }

    await this.transactionsRepository.remove(transaction);
  }

  async getTransactionStatsByUserId(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    transactionCount: number;
  }> {
    const transactions = await this.findByUserId(userId);

    const stats = transactions.reduce(
      (acc, transaction) => {
        if (transaction.status === TransactionStatus.COMPLETED) {
          if (transaction.amount > 0) {
            acc.totalIncome += Number(transaction.amount);
          } else {
            acc.totalExpenses += Math.abs(Number(transaction.amount));
          }
        }
        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        currentBalance: 0,
        transactionCount: 0,
      },
    );

    stats.transactionCount = transactions.length;

    // Get current balance from user
    const user = await this.pocketMoneyUsersRepository.findOne({
      where: { id: userId },
    });
    stats.currentBalance = user ? Number(user.currentBalance) : 0;

    return stats;
  }
}
