import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Prediction } from '../../ml/entities/prediction.entity';
import { Asset } from '../../market/entities/asset.entity';
import { TradeDirection } from '../enums/trade-direction.enum';
import { SuggestionStatus } from '../enums/suggestion-status.enum';

@Entity('trade_suggestions')
export class TradeSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  prediction_id: string;

  @ManyToOne(() => Prediction)
  @JoinColumn({ name: 'prediction_id' })
  prediction: Prediction;

  @Index()
  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'enum', enum: TradeDirection })
  direction: TradeDirection;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  entry_price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  stop_loss: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  take_profit: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  risk_reward_ratio: number;

  @Column({ type: 'text' })
  rationale: string;

  @Column({ type: 'boolean', default: true })
  disclaimer_shown: boolean;

  @Index()
  @Column({ type: 'enum', enum: SuggestionStatus, default: SuggestionStatus.OPEN })
  status: SuggestionStatus;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  closed_price: number;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  pnl_percent: number;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
