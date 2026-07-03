import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { NewsSource } from './news-source.entity';

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  source_id: string;

  @ManyToOne(() => NewsSource)
  @JoinColumn({ name: 'source_id' })
  source: NewsSource;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  original_url: string;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string;

  @Index()
  @Column({ type: 'timestamp' })
  published_at: Date;

  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  sentiment_score: number;

  @Column({ type: 'uuid', array: true, nullable: true })
  related_assets: string[];

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
