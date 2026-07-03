import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { Asset } from '../../market/entities/asset.entity';

@Entity('news_article_assets')
export class NewsArticleAsset {
  @PrimaryColumn({ type: 'uuid' })
  news_article_id: string;

  @ManyToOne(() => NewsArticle)
  @JoinColumn({ name: 'news_article_id' })
  news_article: NewsArticle;

  @PrimaryColumn({ type: 'uuid' })
  asset_id: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;
}
