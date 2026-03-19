import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PocketMoneyUser } from './pocket-money-user.entity';

export enum SavingsGoalPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('savings_goals')
export class SavingsGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'childId', nullable: false })
  @Index()
  childId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'targetAmount',
  })
  targetAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'currentAmount',
  })
  currentAmount: number;

  @Column({ type: 'varchar', length: 10, default: '🎯' })
  emoji: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: SavingsGoalPriority.MEDIUM,
  })
  priority: SavingsGoalPriority;

  @Column({ type: 'boolean', default: false, name: 'isCompleted' })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => PocketMoneyUser, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'childId' })
  child: PocketMoneyUser;

  // Business logic
  get progress(): number {
    if (!this.targetAmount || this.targetAmount <= 0) return 0;
    return Math.min((Number(this.currentAmount) / Number(this.targetAmount)) * 100, 100);
  }

  get remainingAmount(): number {
    return Math.max(Number(this.targetAmount) - Number(this.currentAmount), 0);
  }
}
