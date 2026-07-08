
import { Link } from 'react-router-dom';
import { useBinanceTicker } from '../hooks/useBinanceTicker';

interface HeaderProps {
  currentPath: string;
}

const TICKER_SYMBOLS = ['BTCUSDT', 'ETHUSDT'];

export default function Header({ currentPath }: HeaderProps) {
  // Pass the symbols we want to track
  const tickers = useBinanceTicker(TICKER_SYMBOLS);
  
  const btc = tickers['BTCUSDT'];
  const eth = tickers['ETHUSDT'];

  return (
    <header className="top-header">
      <Link to="/" className="logo-container">
        Chart<span>ix</span>
      </Link>
      
      <nav className="nav-menu">
        <Link to="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/markets" className={`nav-item ${currentPath === '/markets' ? 'active' : ''}`}>Markets</Link>
        <Link to="/news" className={`nav-item ${currentPath === '/news' ? 'active' : ''}`}>News</Link>
        <Link to="/calendar" className={`nav-item ${currentPath === '/calendar' ? 'active' : ''}`}>Calendar</Link>
      </nav>

      <div className="market-ticker">
        <div className="ticker-item">
          <span className="ticker-pair">BTC/USDT</span>
          {btc ? (
            <>
              <span className={`ticker-price ${btc.isUp ? 'up' : 'down'}`}>{btc.price}</span>
              <span className={`ticker-change ${btc.isUp ? 'up' : 'down'}`}>{btc.change}</span>
            </>
          ) : (
            <span className="ticker-price">Loading...</span>
          )}
        </div>
        <div className="ticker-item">
          <span className="ticker-pair">ETH/USDT</span>
          {eth ? (
            <>
              <span className={`ticker-price ${eth.isUp ? 'up' : 'down'}`}>{eth.price}</span>
              <span className={`ticker-change ${eth.isUp ? 'up' : 'down'}`}>{eth.change}</span>
            </>
          ) : (
            <span className="ticker-price">Loading...</span>
          )}
        </div>
      </div>

      <div className="header-actions">
        <a href="#login" className="btn-connect">Login</a>
      </div>
    </header>
  );
}
