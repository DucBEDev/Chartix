import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketData } from '../hooks/useMarketData';

export default function Markets() {
  const { coins, loadMore, isLoading, hasMore, requestSort, sortConfig } = useMarketData();
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastCoinElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  const handleTrade = (symbol: string) => {
    navigate(`/?symbol=${symbol}`);
  };

  const formatCurrency = (val: number) => {
    if (val > 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val > 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <span style={{ opacity: 0.2, marginLeft: 4 }}>↕</span>;
    return sortConfig.direction === 'asc' ? <span style={{ marginLeft: 4 }}>↑</span> : <span style={{ marginLeft: 4 }}>↓</span>;
  };

  return (
    <div>
      <h1 className="page-title">Market Overview</h1>
      <p className="page-subtitle">Live cryptocurrency prices, volumes, and trends.</p>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="table-container" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <table className="market-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
              <tr>
                <th onClick={() => requestSort('name')} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>
                  Asset {renderSortIcon('name')}
                </th>
                <th onClick={() => requestSort('price')} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>
                  Price {renderSortIcon('price')}
                </th>
                <th onClick={() => requestSort('change')} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>
                  24h Change {renderSortIcon('change')}
                </th>
                <th onClick={() => requestSort('volume')} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer' }}>
                  24h Volume (USDT) {renderSortIcon('volume')}
                </th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, index) => {
                const isLast = index === coins.length - 1;
                const changeClass = coin.change >= 0 ? 'up' : 'down';
                const sign = coin.change > 0 ? '+' : '';

                return (
                  <tr key={coin.symbol} ref={isLast ? lastCoinElementRef : null} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div className="coin-cell" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: 18, width: 24, textAlign: 'center' }}>
                          {coin.name.charAt(0)}
                        </span>
                        {coin.name} <span className="coin-symbol" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{coin.symbol}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>{formatPrice(coin.price)}</td>
                    <td className={`ticker-price ${changeClass}`} style={{ padding: '16px 20px' }}>
                      {sign}{coin.change.toFixed(2)}%
                    </td>
                    <td style={{ padding: '16px 20px' }}>{formatCurrency(coin.volume)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <button 
                        className="btn-connect" 
                        style={{ padding: '6px 16px', fontSize: 13, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => handleTrade(coin.symbol)}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {isLoading && (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
              Loading markets...
            </div>
          )}
          {!isLoading && hasMore && (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
              Loading more coins...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
