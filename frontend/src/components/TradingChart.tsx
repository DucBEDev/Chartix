import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, type ISeriesApi, type UTCTimestamp, CandlestickSeries, type LogicalRange } from 'lightweight-charts';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

export default function TradingChart({ symbol, interval }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Ref to hold all chart data chronologically
  const chartDataRef = useRef<any[]>([]);
  const isFetchingRef = useRef<boolean>(false);
  const isEndOfHistoryRef = useRef<boolean>(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Reset refs on symbol/interval change
    chartDataRef.current = [];
    isFetchingRef.current = false;
    isEndOfHistoryRef.current = false;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(31, 41, 55, 0.3)' },
        horzLines: { color: 'rgba(31, 41, 55, 0.3)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Fetch Historical Data Helper
    const fetchHistory = async (endTime?: number) => {
      if (isFetchingRef.current || isEndOfHistoryRef.current) return;
      isFetchingRef.current = true;

      try {
        let url = `${import.meta.env.VITE_BINANCE_REST_API}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
        if (endTime) {
          url += `&endTime=${endTime}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.length === 0) {
          isEndOfHistoryRef.current = true;
          isFetchingRef.current = false;
          return;
        }

        const formattedData = data.map((d: any) => ({
          time: (d[0] / 1000) as UTCTimestamp,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        // Merge data
        const oldData = chartDataRef.current;
        // The newly fetched data is older than our existing data because we passed endTime
        // Wait, if it's the initial fetch, oldData is empty.
        // If it's a pagination fetch, data returned is older, but wait, the last item of formattedData 
        // might overlap with our first item if we didn't subtract 1 from endTime.
        // To be safe, we merge and sort by time, then remove duplicates.
        
        const combined = [...formattedData, ...oldData];
        const uniqueData = Array.from(new Map(combined.map(item => [item.time, item])).values());
        uniqueData.sort((a, b) => (a.time as number) - (b.time as number));

        chartDataRef.current = uniqueData;
        candlestickSeries.setData(uniqueData);

      } catch (error) {
        console.error('Failed to fetch historical data', error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Initial Fetch
    fetchHistory().then(() => {
      // Connect WebSocket for live updates after history is loaded
      const wsUrl = `${import.meta.env.VITE_BINANCE_WS_API}/ws/${symbol.toLowerCase()}@kline_${interval}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const kline = message.k;
        
        if (kline) {
          const update = {
            time: (kline.t / 1000) as UTCTimestamp,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };
          
          // Update the chart
          candlestickSeries.update(update);
          
          // Also update our ref so if we paginate, we don't lose the latest live candle
          const dataArray = chartDataRef.current;
          if (dataArray.length > 0) {
            const lastCandle = dataArray[dataArray.length - 1];
            if (lastCandle.time === update.time) {
              dataArray[dataArray.length - 1] = update;
            } else if ((update.time as number) > (lastCandle.time as number)) {
              dataArray.push(update);
            }
          }
        }
      };
    });

    // Handle Pagination (Infinite Scroll)
    const handleVisibleLogicalRangeChange = (logicalRange: LogicalRange | null) => {
      if (!logicalRange) return;
      
      // If user scrolls and the left-most visible candle index is less than 100, fetch more
      if (logicalRange.from < 100) {
        const currentData = chartDataRef.current;
        if (currentData.length > 0) {
          const oldestTime = (currentData[0].time as number) * 1000;
          fetchHistory(oldestTime - 1);
        }
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);

    // Cleanup
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      chart.remove();
    };
  }, [symbol, interval]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
}
