import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { SourceType } from '../enums/source-type.enum';

@Entity('news_sources')
export class NewsSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: SourceType })
  source_type: SourceType;

  @Column({ type: 'text' })
  feed_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 15 })
  fetch_interval_minutes: number;

  @Column({ type: 'timestamp', nullable: true })
  last_fetched_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
