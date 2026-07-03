import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { KbDocument } from './kb-document.entity';

@Entity('kb_chunks')
export class KbChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  document_id: string;

  @ManyToOne(() => KbDocument)
  @JoinColumn({ name: 'document_id' })
  document: KbDocument;

  @Column({ type: 'int' })
  chunk_index: number;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  vector_id: string;

  @Column({ type: 'int', nullable: true })
  token_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
