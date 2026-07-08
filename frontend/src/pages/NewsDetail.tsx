import { useLocation, useNavigate } from 'react-router-dom';
import type { NewsArticle } from '../hooks/useNewsData';

export default function NewsDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state?.article as NewsArticle;

  if (!article) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Article not found.</p>
        <button onClick={() => navigate('/news')} className="btn-connect" style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8 }}>
          Go back to News
        </button>
      </div>
    );
  }

  const getTimeFormat = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fromUrl = location.state?.from || '/news';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <button 
        onClick={() => navigate(fromUrl)} 
        style={{ 
          background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)',
          fontSize: 14, fontWeight: 500
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to News
      </button>
      
      <div className="news-detail-header" style={{ marginTop: 24 }}>
        <span className="news-tag" style={{ 
          marginBottom: 16, display: 'inline-block', fontSize: 12, 
          background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', 
          padding: '4px 10px', borderRadius: 4, fontWeight: 600 
        }}>
          {article.tags.split(',')[0] || 'CRYPTO'}
        </span>
        <h1 className="news-detail-title" style={{ fontSize: 32, marginBottom: 16, lineHeight: 1.3 }}>{article.title}</h1>
        <div className="news-detail-meta" style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: 14, alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>By {article.source}</span>
          <span>•</span>
          <span>{getTimeFormat(article.published_on)}</span>
        </div>
      </div>
      
      <img 
        src={article.imageurl} 
        alt={article.title} 
        className="news-detail-img" 
        style={{ width: '100%', borderRadius: 12, marginTop: 32, marginBottom: 32, objectFit: 'cover', maxHeight: 400 }}
      />
      
      <div className="news-detail-body" style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--text-primary)' }}>
        <p style={{ marginBottom: 24, opacity: 0.9 }}>{article.body}</p>
        
        <div style={{ marginTop: 48, padding: 32, background: 'var(--bg-surface)', borderRadius: 12, textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 15 }}>This is an excerpt. Read the full article on the original source.</p>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-connect" 
            style={{ display: 'inline-block', textDecoration: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600 }}
          >
            Read on {article.source}
          </a>
        </div>
      </div>
    </div>
  );
}
