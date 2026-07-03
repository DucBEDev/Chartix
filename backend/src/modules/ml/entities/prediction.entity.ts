import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MlModel } from './ml-model.entity';
import { Asset } from '../../market/entities/asset.entity';
import { PredictionLabel } from '../enums/prediction-label.enum';

@Entity('predictions')
@Index(['asset_id', 'predicted_at'])
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  model_id: string;

  @ManyToOne(() => MlModel)
  @JoinColumn({ name: 'model_id' })
  model: MlModel;

  @Column({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'timestamp' })
  predicted_at: Date;

  @Index()
  @Column({ type: 'timestamp' })
  target_time: Date;

  @Column({ type: 'enum', enum: PredictionLabel })
  predicted_label: PredictionLabel;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  confidence: number;

  @Column({ type: 'jsonb', nullable: true })
  features_snapshot: Record<string, any>;

  @Column({ type: 'enum', enum: PredictionLabel, nullable: true })
  actual_label: PredictionLabel;

  @Column({ type: 'boolean', nullable: true })
  is_correct: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
