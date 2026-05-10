import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Stack } from '@mui/material';

const API_URL = 'http://localhost:3000'; // Backend server URL

function PopularSearches() {
  const [popularTerms, setPopularTerms] = useState<string[]>([]);
  const navigate = useNavigate();

  // Use useCallback to memoize the fetch function
  const fetchPopularSearches = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/popular-searches`);
      if (!response.ok) {
        throw new Error('Failed to fetch popular searches');
      }
      const data = await response.json();
      setPopularTerms(data);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      setPopularTerms([]); // Clear terms on error
    }
  }, []);

  useEffect(() => {
    // Fetch data when the component mounts
    fetchPopularSearches();

    // Also, add an event listener to refetch when the user focuses the window
    // This helps update the list when they navigate back to the page
    window.addEventListener('focus', fetchPopularSearches);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('focus', fetchPopularSearches);
    };
  }, [fetchPopularSearches]); // Depend on the memoized fetch function

  const handleChipClick = (term: string) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  if (popularTerms.length === 0) {
    return null; // Don't render the component if there are no popular searches yet
  }

  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <Typography 
        variant="subtitle2" 
        gutterBottom 
        sx={{ 
          color: 'secondary.main', 
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          mb: 2
        }}
      >
        Popular Searches
      </Typography>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          overflowX: 'auto',
          py: 1,
          px: 2,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          justifyContent: 'center',
        }}
      >
        {popularTerms.map((term) => (
          <Chip
            key={term}
            label={term}
            onClick={() => handleChipClick(term)}
            variant="outlined"
            clickable
          />
        ))}
      </Stack>
    </Box>
  );
}

export default PopularSearches;
