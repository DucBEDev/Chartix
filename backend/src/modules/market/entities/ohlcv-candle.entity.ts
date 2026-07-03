import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { CandleTimeframe } from '../enums/candle-timeframe.enum';

@Entity('ohlcv_candles')
@Index('idx_candle_unique', ['asset_id', 'timeframe', 'open_time'], { unique: true })
export class OhlcvCandle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'enum', enum: CandleTimeframe })
  timeframe: CandleTimeframe;

  @Index()
  @Column({ type: 'timestamp' })
  open_time: Date;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  open: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  high: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  low: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  close: number;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  volume: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
