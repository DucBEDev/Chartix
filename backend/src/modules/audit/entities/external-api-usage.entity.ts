import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('external_api_usage')
@Index(['provider', 'window_date'], { unique: true })
export class ExternalApiUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'int', default: 1 })
  request_count: number;

  @Column({ type: 'date' })
  window_date: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
