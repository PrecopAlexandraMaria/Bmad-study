import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mae_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage whenever favorites change
  const saveFavorites = (newFavorites: number[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  };

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      saveFavorites(favorites.filter(favId => favId !== id));
    } else {
      saveFavorites([...favorites, id]);
    }
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
