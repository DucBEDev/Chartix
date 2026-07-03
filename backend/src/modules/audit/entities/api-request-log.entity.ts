import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('api_request_logs')
export class ApiRequestLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  endpoint: string;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'int', nullable: true })
  status_code: number;

  @Column({ type: 'int', nullable: true })
  latency_ms: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
