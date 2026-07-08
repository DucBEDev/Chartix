import { useState, useMemo } from 'react';
import { useCalendarData } from '../hooks/useCalendarData';

const countryToFlag: Record<string, string> = {
  'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵', 
  'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭', 'NZD': '🇳🇿', 'CNY': '🇨🇳'
};

const getImpactColor = (impact: string) => {
  switch(impact) {
    case 'High': return 'var(--color-down)';
    case 'Medium': return '#F59E0B'; // Orange
    case 'Low': return 'var(--color-up)';
    default: return 'var(--text-secondary)';
  }
};

export default function Calendar() {
  const { events, isLoading, error } = useCalendarData();
  
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [impactFilter, setImpactFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');

  const uniqueCurrencies = useMemo(() => {
    return Array.from(new Set(events.map(e => e.country))).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = events;
    
    if (impactFilter !== 'All') {
      result = result.filter(e => e.impact === impactFilter);
    }
    
    if (currencyFilter !== 'All') {
      result = result.filter(e => e.country === currencyFilter);
    }
    
    if (timeFilter === 'Today') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      result = result.filter(e => e.timestamp >= startOfDay && e.timestamp <= endOfDay);
    }
    
    return result;
  }, [events, impactFilter, currencyFilter, timeFilter]);

  // Helper to format local time
  const formatLocalTime = (timestampMs: number) => {
    return new Intl.DateTimeFormat(navigator.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestampMs));
  };

  return (
    <div>
      <div>
        <h1 className="page-title">Economic Calendar</h1>
        <p className="page-subtitle">Track important macroeconomic events affecting the markets. (Auto-synced to your local timezone)</p>
      </div>
      
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div className="panel-title">{timeFilter} Events</div>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <select 
              className="coin-select" 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>

            <select 
              className="coin-select" 
              value={impactFilter} 
              onChange={e => setImpactFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="All">All Impacts</option>
              <option value="High">High Impact</option>
              <option value="Medium">Medium Impact</option>
              <option value="Low">Low Impact</option>
            </select>

            <select 
              className="coin-select" 
              value={currencyFilter} 
              onChange={e => setCurrencyFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="All">All Currencies</option>
              {uniqueCurrencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading && <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading economic calendar...</p>}
        {error && <p style={{ padding: 24, textAlign: 'center', color: 'var(--color-down)' }}>Error: {error}</p>}
        
        {!isLoading && !error && filteredEvents.length === 0 && (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No events found for the selected filters.</p>
        )}

        {!isLoading && !error && filteredEvents.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 13 }}>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Time (Local)</th>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Currency</th>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Impact</th>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Event</th>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Actual</th>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Forecast</th>
                  <th style={{ padding: '16px 24px', fontWeight: 500 }}>Previous</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const flag = countryToFlag[event.country] || '🌐';
                  const isPast = event.timestamp < Date.now();
                  
                  return (
                    <tr key={event.id} style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      opacity: isPast ? 0.6 : 1,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px', fontSize: 14 }}>
                        {formatLocalTime(event.timestamp)}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600 }}>
                        <span style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>{flag}</span>
                        {event.country}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: 4, 
                          fontSize: 12, 
                          fontWeight: 600, 
                          color: getImpactColor(event.impact),
                          backgroundColor: `${getImpactColor(event.impact)}20` // 20 hex for 12% opacity
                        }}>
                          {event.impact}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {event.title}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: event.actual ? 'var(--color-up)' : 'inherit' }}>
                        {event.actual || '-'}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-secondary)' }}>
                        {event.forecast || '-'}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-secondary)' }}>
                        {event.previous || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
