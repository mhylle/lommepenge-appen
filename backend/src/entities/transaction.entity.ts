import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { Family } from './family.entity';
import { PocketMoneyUser } from './pocket-money-user.entity';

export enum TransactionType {
  ALLOWANCE = 'allowance',
  BONUS = 'bonus',
  CHORE_REWARD = 'chore_reward',
  PURCHASE = 'purchase',
  SAVINGS = 'savings',
  PENALTY = 'penalty',
  GIFT = 'gift',
  TRANSFER = 'transfer',
  CORRECTION = 'correction',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'userId', nullable: false })
  @Index()
  userId: string;

  @Column({ type: 'uuid', name: 'familyId', nullable: false })
  @Index()
  familyId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  @Index()
  type: TransactionType;

  @Column({
    type: 'varchar',
    length: 50,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number; // Positive for income, negative for expenses

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'balanceAfter', nullable: true })
  balanceAfter: number; // Balance after this transaction

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // e.g., 'toys', 'books', 'candy', 'chores'

  // Visual elements for the "Living Scrapbook" theme
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'stickerType' })
  stickerType: string; // e.g., 'star', 'heart', 'coin', 'trophy'

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'stickerColor' })
  stickerColor: string; // Hex color for the sticker

  @Column({ type: 'json', nullable: true })
  metadata: {
    choreDetails?: {
      choreName: string;
      completedAt: Date;
      difficulty: 'easy' | 'medium' | 'hard';
    };
    purchaseDetails?: {
      itemName: string;
      store?: string;
      receipt?: string; // URL to receipt image
    };
    allowanceDetails?: {
      weekStarting: Date;
      weekEnding: Date;
      isRegular: boolean;
    };
    transferDetails?: {
      fromUserId?: string;
      toUserId?: string;
      reason: string;
    };
  };

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: false })
  @Index()
  createdByUserId: string; // Parent/guardian who created the transaction

  @Column({ type: 'date', name: 'transactionDate', nullable: false })
  @Index()
  transactionDate: Date; // When the transaction actually occurred

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string; // Additional notes from parent/child

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => PocketMoneyUser, (user) => user.transactions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: PocketMoneyUser;

  @ManyToOne(() => Family, (family) => family.transactions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  // Business logic methods
  get isIncome(): boolean {
    return this.amount > 0;
  }

  get isExpense(): boolean {
    return this.amount < 0;
  }

  get formattedAmount(): string {
    const absAmount = Math.abs(this.amount);
    const sign = this.isIncome ? '+' : '-';
    return `${sign}${absAmount.toFixed(2)} DKK`;
  }

  get displayDescription(): string {
    if (this.description) {
      return this.description;
    }

    // Generate description based on type
    switch (this.type) {
      case TransactionType.ALLOWANCE:
        return 'Ugentlig lommepenge';
      case TransactionType.BONUS:
        return 'Bonus';
      case TransactionType.CHORE_REWARD:
        return this.metadata?.choreDetails?.choreName 
          ? `Arbejde: ${this.metadata.choreDetails.choreName}`
          : 'Arbejde belønning';
      case TransactionType.PURCHASE:
        return this.metadata?.purchaseDetails?.itemName 
          ? `Køb: ${this.metadata.purchaseDetails.itemName}`
          : 'Indkøb';
      case TransactionType.SAVINGS:
        return 'Overførsel til opsparing';
      case TransactionType.PENALTY:
        return 'Straf/fradrag';
      case TransactionType.GIFT:
        return 'Gave';
      case TransactionType.TRANSFER:
        return 'Overførsel';
      default:
        return 'Transaktion';
    }
  }

  @BeforeInsert()
  setTransactionDate() {
    if (!this.transactionDate) {
      this.transactionDate = new Date();
    }
  }
}