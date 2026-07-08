import { useState, useEffect } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  time: string;
  impact: 'High' | 'Medium' | 'Low' | 'Non-Economic';
  forecast: string;
  previous: string;
  actual: string;
  timestamp: number;
}

const parseESTtoTimestamp = (dateStr: string, timeStr: string): number => {
  if (!dateStr) return 0;
  let t = timeStr || '12:00am';
  if (t.toLowerCase().includes('day') || t.toLowerCase().includes('tentative')) {
    t = '12:00am';
  }
  
  // dateStr is MM-DD-YYYY
  const [month, day, year] = dateStr.split('-');
  
  // parse time
  const isPM = t.toLowerCase().includes('pm');
  let [hoursStr, minutesStr] = t.replace(/(am|pm)/i, '').split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || '0', 10);
  
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  // Since we fetch through a proxy, ForexFactory auto-detects the proxy's IP timezone
  // which is typically UTC for cloud servers like allorigins.win.
  // Therefore, we can safely assume the time provided in the XML is already in UTC!
  const utcMs = Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
  
  return utcMs;
};

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setIsLoading(true);
        // Using CORS proxy to fetch the XML
        const proxyUrl = import.meta.env.VITE_CORS_PROXY || 'https://api.allorigins.win/raw?url=';
        const targetUrl = import.meta.env.VITE_FOREXFACTORY_XML_API || 'https://nfs.faireconomy.media/ff_calendar_thisweek.xml';
        
        const response = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`);
        const xmlText = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const eventNodes = xmlDoc.querySelectorAll('event');
        const parsedEvents: CalendarEvent[] = [];
        
        eventNodes.forEach((node, index) => {
          const title = node.querySelector('title')?.textContent || '';
          const country = node.querySelector('country')?.textContent || '';
          const date = node.querySelector('date')?.textContent || '';
          const time = node.querySelector('time')?.textContent || '';
          const impactRaw = node.querySelector('impact')?.textContent || 'Low';
          const forecast = node.querySelector('forecast')?.textContent || '';
          const previous = node.querySelector('previous')?.textContent || '';
          const actual = node.querySelector('actual')?.textContent || '';
          
          let impact: CalendarEvent['impact'] = 'Low';
          if (impactRaw.includes('High')) impact = 'High';
          else if (impactRaw.includes('Medium')) impact = 'Medium';
          else if (impactRaw.includes('Non')) impact = 'Non-Economic';
          
          const timestamp = parseESTtoTimestamp(date, time);
          
          parsedEvents.push({
            id: `event-${index}-${timestamp}`,
            title,
            country,
            date,
            time,
            impact,
            forecast,
            previous,
            actual,
            timestamp
          });
        });
        
        // Sort chronologically
        parsedEvents.sort((a, b) => a.timestamp - b.timestamp);
        
        setEvents(parsedEvents);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch calendar:', err);
        setError(err.message || 'Error fetching calendar data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  return { events, isLoading, error };
}
