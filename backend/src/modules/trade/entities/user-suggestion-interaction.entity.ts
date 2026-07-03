import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TradeSuggestion } from './trade-suggestion.entity';
import { InteractionAction } from '../enums/interaction-action.enum';

@Entity('user_suggestion_interactions')
@Index(['user_id', 'suggestion_id'])
export class UserSuggestionInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  suggestion_id: string;

  @ManyToOne(() => TradeSuggestion)
  @JoinColumn({ name: 'suggestion_id' })
  suggestion: TradeSuggestion;

  @Column({ type: 'enum', enum: InteractionAction })
  action: InteractionAction;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
