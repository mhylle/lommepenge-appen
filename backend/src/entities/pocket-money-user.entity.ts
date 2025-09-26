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

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'profile_picture' })
  profilePicture: string; // URL for polaroid-style card

  @Column({ type: 'varchar', length: 7, default: '#FFB6C1', name: 'card_color' })
  cardColor: string; // Hex color for polaroid card background

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'current_balance' })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'weekly_allowance' })
  weeklyAllowance: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  // Connection to central auth system (optional - for when child gets own account)
  @Column({ type: 'uuid', name: 'auth_user_id', nullable: true })
  @Index()
  authUserId: string; // References central auth system user ID (optional)

  // Family relationship
  @Column({ type: 'uuid', name: 'familyId', nullable: false })
  @Index()
  familyId: string;

  // Child preferences and settings
  @Column({ type: 'json', nullable: true })
  preferences: {
    favoriteStickers?: string[];
    cardStyle?: string;
    notificationSettings?: {
      allowanceReminder: boolean;
      balanceUpdates: boolean;
    };
  };

  @Column({ type: 'varchar', length: 50, default: 'child' })
  role: string; // 'child', 'teen' - different UI/features

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
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
  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  get displayName(): string {
    return this.name;
  }

  get cardDisplayBalance(): string {
    return `${this.currentBalance.toFixed(2)} DKK`;
  }
}