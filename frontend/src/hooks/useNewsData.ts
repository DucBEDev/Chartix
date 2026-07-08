import { useState, useEffect } from 'react';

export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  imageurl: string;
  url: string;
  source: string;
  tags: string;
  published_on: number;
}

export function useNewsData() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const RSS_FEEDS = [
          'https://cointelegraph.com/rss',
          'https://www.coindesk.com/arc/outboundfeeds/rss/',
          'https://www.newsbtc.com/feed/',
          'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',
          'https://finance.yahoo.com/news/rssindex'
        ];
        
        const baseUrl = import.meta.env.VITE_RSS2JSON_API || 'https://api.rss2json.com/v1/api.json?rss_url=';
        
        const fetchPromises = RSS_FEEDS.map(feed => 
          fetch(`${baseUrl}${encodeURIComponent(feed)}`).then(res => res.json()).catch(() => null)
        );
        
        const results = await Promise.all(fetchPromises);
        let allArticles: NewsArticle[] = [];
        
        results.forEach(data => {
          if (data && data.status === 'ok' && Array.isArray(data.items)) {
            const formattedArticles = data.items.map((item: any) => {
              // Strip HTML tags from description for the excerpt
              const cleanBody = (item.description || item.content || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
              
              // Normalize source name
              let sourceName = data.feed?.title?.replace(' News', '') || 'Crypto News';
              if (sourceName.toLowerCase().includes('coindesk')) sourceName = 'CoinDesk';
              if (sourceName.toLowerCase().includes('cointelegraph')) sourceName = 'Cointelegraph';
              if (sourceName.toLowerCase().includes('newsbtc')) sourceName = 'NewsBTC';
              if (sourceName.toLowerCase().includes('wsj')) sourceName = 'Wall Street Journal';
              if (sourceName.toLowerCase().includes('yahoo')) sourceName = 'Yahoo Finance';
              
              // Extract a category/tag
              let primaryTag = 'MARKETS';
              if (sourceName === 'Wall Street Journal' || sourceName === 'Yahoo Finance') {
                primaryTag = 'MACRO';
              } else if (item.categories && item.categories.length > 0) {
                primaryTag = item.categories[0].toUpperCase();
              }
              
              return {
                id: item.guid || item.link,
                title: item.title,
                body: cleanBody,
                imageurl: item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1621504450181-5d156f065317?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                url: item.link,
                source: sourceName,
                tags: primaryTag,
                published_on: new Date(item.pubDate).getTime() / 1000
              };
            });
            allArticles = [...allArticles, ...formattedArticles];
          }
        });
        
        if (allArticles.length > 0) {
          // Sort descending by publish date
          allArticles.sort((a, b) => b.published_on - a.published_on);
          setArticles(allArticles);
        } else {
          setError('Failed to fetch news from sources');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching news');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { articles, isLoading, error };
}
