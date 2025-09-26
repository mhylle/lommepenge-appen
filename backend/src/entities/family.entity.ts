import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { PocketMoneyUser } from './pocket-money-user.entity';
import { Transaction } from './transaction.entity';

@Entity('families')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'parentUserId', nullable: false })
  @Index()
  parentUserId: string; // References central auth system user ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture: string; // URL or path to family profile picture

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Family settings for pocket money management
  @Column({ type: 'varchar', length: 3, default: 'DKK' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'defaultAllowance' })
  defaultAllowance: number;

  @Column({ type: 'varchar', length: 50, default: 'weekly', name: 'allowanceFrequency' })
  allowanceFrequency: string; // 'weekly', 'monthly', 'biweekly'

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.families, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentUserId' })
  parent: User;

  @OneToMany(() => PocketMoneyUser, (user) => user.family, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  children: PocketMoneyUser[];

  @OneToMany(() => Transaction, (transaction) => transaction.family)
  transactions: Transaction[];
}