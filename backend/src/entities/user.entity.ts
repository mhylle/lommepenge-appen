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
    comment: 'List of apps the user has access to'
  })
  apps: string[];

  @Column('simple-json', { 
    default: () => "'{}'",
    comment: 'App-specific roles for the user'
  })
  roles: Record<string, string[]>;

  @OneToMany(() => Family, family => family.parent, { cascade: true })
  families: Family[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}