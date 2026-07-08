import { useState } from 'react';
import TradingChart from '../components/TradingChart';

const TOP_COINS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
  'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'SHIBUSDT', 'DOTUSDT', 
  'LINKUSDT', 'TRXUSDT', 'MATICUSDT', 'NEARUSDT', 'LTCUSDT', 
  'BCHUSDT', 'ICPUSDT', 'UNIUSDT', 'APTUSDT', 'FILUSDT'
];

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
];

export default function Dashboard() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');

  // Simple mock AI logic based on timeframe and symbol
  const isUp = symbol === 'BTCUSDT' || symbol === 'ETHUSDT' || symbol === 'SOLUSDT';
  const confidence = symbol === 'BTCUSDT' ? '87%' : '72%';

  return (
    <div>
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back. Here's your market overview.</p>
      </div>
      
      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        
        <div className="chart-toolbar">
          <select 
            className="coin-select" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
          >
            {TOP_COINS.map(coin => (
              <option key={coin} value={coin}>
                {coin.replace('USDT', '/USDT')}
              </option>
            ))}
          </select>

          <div className="timeframe-group">
            {TIMEFRAMES.map(tf => (
              <button 
                key={tf.value}
                className={`timeframe-btn ${interval === tf.value ? 'active' : ''}`}
                onClick={() => setInterval(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div className="panel-title">
              {symbol.replace('USDT', '/USDT')} 
              <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--text-secondary)' }}>
                {TIMEFRAMES.find(t => t.value === interval)?.label}
              </span>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="ai-signal-widget">
              <div className="signal-header">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                AI Trend
              </div>
              <div className="signal-value" style={{ color: isUp ? 'var(--color-up)' : 'var(--color-down)' }}>
                {isUp ? 'BULLISH' : 'BEARISH'}
              </div>
              <div className="signal-details">
                <span>Conf: <strong>{confidence}</strong></span>
              </div>
            </div>
            
            {/* The actual chart component */}
            <TradingChart symbol={symbol} interval={interval} />
          </div>
        </div>
      </div>
    </div>
  );
}
