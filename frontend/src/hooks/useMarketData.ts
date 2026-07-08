import { useState, useEffect, useRef, useMemo } from 'react';

export interface MarketCoin {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

export type SortKey = keyof MarketCoin;
export type SortDirection = 'asc' | 'desc';

export function useMarketData() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [displayedCount, setDisplayedCount] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
    key: 'volume', 
    direction: 'desc' 
  });
  
  const wsRef = useRef<WebSocket | null>(null);

  // Initial fetch from REST API
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BINANCE_REST_API}/api/v3/ticker/24hr`);
        const data = await res.json();
        
        // Filter USDT pairs and sort by quoteVolume to get the top 100 active coins
        let usdtPairs = data
          .filter((d: any) => d.symbol.endsWith('USDT') && !d.symbol.includes('DOWN') && !d.symbol.includes('UP') && !d.symbol.includes('BULL') && !d.symbol.includes('BEAR'))
          .map((d: any) => ({
            symbol: d.symbol,
            name: d.symbol.replace('USDT', ''), // e.g. BTC
            price: parseFloat(d.lastPrice),
            change: parseFloat(d.priceChangePercent),
            volume: parseFloat(d.quoteVolume)
          }))
          .sort((a: any, b: any) => b.volume - a.volume)
          .slice(0, 150); // Get top 150 to keep WebSocket efficient
          
        setCoins(usdtPairs);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch market data", err);
        setIsLoading(false);
      }
    };
    
    fetchMarkets();
  }, []);

  // Subscribe to specific tickers via WebSocket payload
  useEffect(() => {
    if (coins.length === 0) return;

    const wsUrl = `${import.meta.env.VITE_BINANCE_WS_API}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Subscribe to all 150 coins
      const params = coins.map(c => `${c.symbol.toLowerCase()}@ticker`);
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: params,
        id: 1
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Expected data from @ticker is a single object per message
      if (data.e === '24hrTicker') {
        setCoins(prevCoins => {
          // We only update if the price or change is different to avoid unnecessary renders
          let hasChanges = false;
          const nextCoins = prevCoins.map(coin => {
            if (coin.symbol === data.s) {
              const newPrice = parseFloat(data.c);
              const newChange = parseFloat(data.P);
              const newVolume = parseFloat(data.q);
              
              if (coin.price !== newPrice || coin.change !== newChange || coin.volume !== newVolume) {
                hasChanges = true;
                return {
                  ...coin,
                  price: newPrice,
                  change: newChange,
                  volume: newVolume,
                };
              }
            }
            return coin;
          });
          
          return hasChanges ? nextCoins : prevCoins;
        });
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [coins.length > 0]);

  // Handle Sorting
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCoins = useMemo(() => {
    const sortableItems = [...coins];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [coins, sortConfig]);

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + 20, sortedCoins.length));
  };

  return { 
    coins: sortedCoins.slice(0, displayedCount), 
    loadMore, 
    isLoading,
    hasMore: displayedCount < sortedCoins.length,
    requestSort,
    sortConfig
  };
}
