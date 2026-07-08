import { useState, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useNewsData, type NewsArticle } from '../hooks/useNewsData';

export default function News() {
  const { articles, isLoading, error } = useNewsData();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States from URL
  const sourceFilter = searchParams.get('source') || 'All';
  const categoryFilter = searchParams.get('category') || 'All';
  const timeFilter = searchParams.get('time') || 'All';
  
  // Pagination State from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const itemsPerPage = 9;

  // Helper to update params
  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      // Remove default values to keep URL clean
      if (value === 'All' || (key === 'page' && value === '1')) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const setSourceFilter = (val: string) => updateParams({ source: val, page: '1' });
  const setCategoryFilter = (val: string) => updateParams({ category: val, page: '1' });
  const setTimeFilter = (val: string) => updateParams({ time: val, page: '1' });
  const setCurrentPageFn = (val: number) => updateParams({ page: val.toString() });

  const handleReadMore = (article: NewsArticle) => {
    navigate('/news/detail', { state: { article, from: location.pathname + location.search } });
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Extract unique sources and categories for dropdowns
  const sources = useMemo(() => ['All', ...Array.from(new Set(articles.map(a => a.source)))], [articles]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(articles.map(a => a.tags)))], [articles]);

  // Apply Filters
  const filteredArticles = useMemo(() => {
    let result = articles;
    
    if (sourceFilter !== 'All') {
      result = result.filter(a => a.source === sourceFilter);
    }
    
    if (categoryFilter !== 'All') {
      result = result.filter(a => a.tags === categoryFilter);
    }
    
    if (timeFilter !== 'All') {
      const now = Date.now() / 1000;
      if (timeFilter === 'Last 24h') {
        result = result.filter(a => (now - a.published_on) <= 86400);
      } else if (timeFilter === 'Last 7 Days') {
        result = result.filter(a => (now - a.published_on) <= 86400 * 7);
      }
    }
    
    return result;
  }, [articles, sourceFilter, categoryFilter, timeFilter]);

  // Apply Pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <h1 className="page-title">Market News</h1>
      <p className="page-subtitle">Latest updates from the crypto, forex, and financial world.</p>

      {/* Filters Section */}
      <div className="panel" style={{ marginTop: 24, padding: '16px 20px', display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'center', justifyContent: 'flex-start', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Source:</label>
          <select 
            value={sourceFilter} 
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, background: '#1e222d', border: '1px solid var(--border-color)', color: '#d1d4dc', outline: 'none', cursor: 'pointer', minWidth: 120 }}
          >
            {sources.map(s => <option key={s} value={s} style={{ background: '#1e222d', color: '#d1d4dc' }}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Category:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, background: '#1e222d', border: '1px solid var(--border-color)', color: '#d1d4dc', outline: 'none', cursor: 'pointer', minWidth: 120 }}
          >
            {categories.map(c => <option key={c} value={c} style={{ background: '#1e222d', color: '#d1d4dc' }}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Time:</label>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, background: '#1e222d', border: '1px solid var(--border-color)', color: '#d1d4dc', outline: 'none', cursor: 'pointer', minWidth: 120 }}
          >
            <option value="All" style={{ background: '#1e222d', color: '#d1d4dc' }}>All Time</option>
            <option value="Last 24h" style={{ background: '#1e222d', color: '#d1d4dc' }}>Last 24h</option>
            <option value="Last 7 Days" style={{ background: '#1e222d', color: '#d1d4dc' }}>Last 7 Days</option>
          </select>
        </div>
      </div>

      {isLoading && <p style={{ marginTop: 24, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading news and market data...</p>}
      {error && <p style={{ marginTop: 24, color: 'var(--color-down)' }}>Error: {error}</p>}

      {!isLoading && !error && (
        <>
          {filteredArticles.length === 0 ? (
            <p style={{ marginTop: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found matching your filters.</p>
          ) : (
            <div className="news-grid-responsive" style={{ marginTop: 24 }}>
              {currentArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="news-card" 
                  onClick={() => handleReadMore(article)}
                  style={{ cursor: 'pointer', background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div 
                    className="news-img" 
                    style={{ 
                      backgroundImage: `url(${article.imageurl})`, 
                      height: 180, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                      backgroundColor: 'var(--bg-default)' // fallback
                    }}
                  ></div>
                  <div className="news-content" style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className="news-meta" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{article.source}</span>
                      <span>{getTimeAgo(article.published_on)}</span>
                    </div>
                    <h3 className="news-card-title" style={{ fontSize: 17, marginBottom: 12, lineHeight: 1.4 }}>{article.title}</h3>
                    <p className="news-excerpt" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                      {article.body.length > 120 ? article.body.substring(0, 120) + '...' : article.body}
                    </p>
                    <div>
                      <span className="news-tag" style={{ fontSize: 11, background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                        {article.tags}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40, alignItems: 'center' }}>
              <button 
                onClick={() => setCurrentPageFn(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-connect"
                style={{ padding: '8px 16px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPageFn(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-connect"
                style={{ padding: '8px 16px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
