import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AssetType } from '../../market/enums/asset-type.enum';
import { CandleTimeframe } from '../../market/enums/candle-timeframe.enum';
import { ModelStatus } from '../enums/model-status.enum';

@Entity('ml_models')
@Index(['name', 'version'], { unique: true })
export class MlModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  model_type: string;

  @Column({ type: 'enum', enum: AssetType })
  asset_type: AssetType;

  @Column({ type: 'enum', enum: CandleTimeframe })
  target_timeframe: CandleTimeframe;

  @Column({ type: 'varchar', length: 20 })
  version: string;

  @Index()
  @Column({ type: 'enum', enum: ModelStatus, default: ModelStatus.STAGING })
  status: ModelStatus;

  @Column({ type: 'text' })
  artifact_path: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  training_dataset_range: string;

  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, any>;

  @Column({ type: 'timestamp' })
  trained_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
