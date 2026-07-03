import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { User } from '../../users/entities/user.entity';
import { AlertCondition } from '../enums/alert-condition.enum';
import { AlertStatus } from '../enums/alert-status.enum';

@Entity('price_alerts')
export class PriceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'enum', enum: AlertCondition })
  condition: AlertCondition;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  target_price: number;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.ACTIVE })
  status: AlertStatus;

  @Column({ type: 'timestamp', nullable: true })
  triggered_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
