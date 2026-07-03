import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { MessageRole } from '../enums/message-role.enum';
import { MessageFeedback } from '../enums/message-feedback.enum';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  session_id: string;

  @ManyToOne(() => ChatSession)
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid', array: true, nullable: true })
  retrieved_chunk_ids: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  model_used: string;

  @Column({ type: 'int', nullable: true })
  latency_ms: number;

  @Column({ type: 'int', nullable: true })
  token_usage: number;

  @Column({ type: 'enum', enum: MessageFeedback, nullable: true })
  feedback: MessageFeedback;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
