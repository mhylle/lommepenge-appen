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

  @Column({ type: 'date', nullable: true, name: 'dateOfBirth' })
  dateOfBirth: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'profilePicture',
  })
  profilePicture: string;

  @Column({ type: 'varchar', length: 7, default: '#FFB6C1', name: 'cardColor' })
  cardColor: string;

  @Column({ type: 'varchar', length: 50, default: 'child' })
  role: string; // 'child', 'teen' - different UI/features

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    name: 'currentBalance',
  })
  currentBalance: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    name: 'weeklyAllowance',
  })
  weeklyAllowance: number;

  @Column({ type: 'boolean', default: true, name: 'isActive' })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  preferences: {
    favoriteStickers?: string[];
    cardStyle?: string;
    notificationSettings?: {
      allowanceReminder: boolean;
      balanceUpdates: boolean;
    };
  };

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
    nullable: true,
  })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: false,
  })
  transactions: Transaction[];

  // Virtual fields for computed properties
  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get displayName(): string {
    return this.name;
  }

  get cardDisplayBalance(): string {
    const balance = Number(this.currentBalance) || 0;
    return `${balance.toFixed(2)} DKK`;
  }
}
