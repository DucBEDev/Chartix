import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { OauthProvider } from '../enums/oauth-provider.enum';

@Entity('oauth_accounts')
@Index(['provider', 'provider_user_id'], { unique: true })
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: OauthProvider })
  provider: OauthProvider;

  @Column({ type: 'varchar', length: 255 })
  provider_user_id: string;

  @Column({ type: 'text', nullable: true })
  access_token: string;

  @Column({ type: 'text', nullable: true })
  refresh_token: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
