import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ImpactLevel } from '../enums/impact-level.enum';

@Entity('economic_events')
@Index(['country_code', 'impact_level'])
export class EconomicEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 5 })
  country_code: string;

  @Column({ type: 'varchar', length: 255 })
  event_name: string;

  @Column({ type: 'enum', enum: ImpactLevel })
  impact_level: ImpactLevel;

  @Index()
  @Column({ type: 'timestamp' })
  event_time: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actual_value: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  forecast_value: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  previous_value: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
