import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AssetType } from '../enums/asset-type.enum';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'varchar', length: 100 })
  display_name: string;

  @Index()
  @Column({ type: 'enum', enum: AssetType })
  asset_type: AssetType;

  @Column({ type: 'varchar', length: 10, nullable: true })
  base_currency: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  quote_currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  exchange_source: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
