import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, default: 'dark' })
  theme: string;

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string;

  @Column({ type: 'text', nullable: true })
  favorite_symbols: string;

  @Column({ type: 'jsonb', nullable: true })
  notification_settings: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
