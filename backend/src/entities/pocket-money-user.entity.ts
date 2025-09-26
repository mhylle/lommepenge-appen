import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Family } from './family.entity';
import { Transaction } from './transaction.entity';

@Entity('pocket_money_users')
export class PocketMoneyUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'child' })
  role: string; // 'child', 'teen' - different UI/features

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'currentBalance' })
  currentBalance: number;

  @Column({ type: 'boolean', default: true, name: 'isActive' })
  isActive: boolean;

  // Connection to central auth system (optional - for when child gets own account)
  @Column({ type: 'uuid', name: 'authUserId', nullable: true })
  @Index()
  authUserId: string; // References central auth system user ID (optional)

  // Family relationship
  @Column({ type: 'uuid', name: 'familyId', nullable: false })
  @Index()
  familyId: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Family, (family) => family.children, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: true,
  })
  transactions: Transaction[];

  // Virtual fields for computed properties
  get displayName(): string {
    return this.name;
  }

  get cardDisplayBalance(): string {
    return `${this.currentBalance.toFixed(2)} DKK`;
  }
}