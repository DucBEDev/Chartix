import { useState, useEffect, useRef } from 'react';

interface TickerData {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

export function useBinanceTicker(symbols: string[]) {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // lowercase symbols for stream name
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const wsUrl = `${import.meta.env.VITE_BINANCE_WS_API}/ws/${streams}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === '24hrTicker') {
        const symbol = data.s;
        const currentPrice = parseFloat(data.c).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        const priceChangePercent = parseFloat(data.P);
        
        setTickers(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            price: currentPrice,
            change: `${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`,
            isUp: priceChangePercent >= 0
          }
        }));
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbols]);

  return tickers;
}
