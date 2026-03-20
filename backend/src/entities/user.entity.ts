import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Family } from './family.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-json', {
    default: () => "'[]'",
    comment: 'List of apps the user has access to',
  })
  apps: string[];

  @Column('simple-json', {
    default: () => "'{}'",
    comment: 'App-specific roles for the user',
  })
  roles: Record<string, string[]>;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 20, default: 'parent' })
  accountType: string; // 'parent' or 'child'

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  pin: string; // hashed 4-digit PIN for child accounts

  @Column({ type: 'uuid', nullable: true, name: 'linkedPocketMoneyUserId' })
  linkedPocketMoneyUserId: string; // reference to PocketMoneyUser

  @Column({ name: 'central_auth_user_id', type: 'uuid', nullable: true })
  centralAuthUserId: string; // reference to central auth service user ID

  // @OneToMany(() => Family, family => family.parent, { cascade: true })
  // families: Family[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
