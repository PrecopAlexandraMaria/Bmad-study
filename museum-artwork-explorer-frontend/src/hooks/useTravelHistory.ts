import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mae_history';
const MAX_HISTORY = 5;

export interface HistoryItem {
  id: number;
  type: 'Museum' | 'Artist' | 'Artwork';
  name: string;
  url: string;
}

export function useTravelHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const logVisit = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      // Remove if already exists to move it to the front
      const filtered = prev.filter(h => !(h.id === item.id && h.type === item.type));
      const updated = [item, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, logVisit, clearHistory };
}
