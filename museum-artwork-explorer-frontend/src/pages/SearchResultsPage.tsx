import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, Button, CircularProgress, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const API_URL = 'http://localhost:3000';

interface Artwork {
  ArtworkID: number;
  Title: string;
  ArtistName: string;
  MuseumName: string;
  StyleName: string;
}

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const activeStyle = searchParams.get('style') || '';

  const [results, setResults] = useState<Artwork[]>([]);
  const [suggestions, setSuggestions] = useState<{ArtworkID: number, Title: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`${API_URL}/api/search/artworks?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          const rawResults = data.results || [];
          const rawSuggestions = data.suggestions || [];
          
          let filtered = rawResults;
          if (activeStyle) {
            filtered = rawResults.filter((a: any) => a.StyleName === activeStyle);
          }
          
          setResults(filtered);
          setSuggestions(rawSuggestions);
          setLoading(false);
          
          if (rawResults.length > 0) {
            fetch(`${API_URL}/api/log-search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ searchTerm: query }),
            }).catch(err => console.error('Failed to log search:', err));
          }
        })
        .catch(err => {
          console.error('Failed to fetch search results:', err);
          setLoading(false);
        });
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query, activeStyle]);

  const handleStyleChange = (style: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (style) newParams.set('style', style);
    else newParams.delete('style');
    setSearchParams(newParams);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'primary.main' }}>
        Search Results
      </Typography>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          {query ? (
            <>Showing {results.length} results for "<strong>{query}</strong>"</>
          ) : (
            'Please enter a search term.'
          )}
        </Typography>

        {query && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Style</InputLabel>
            <Select
              value={activeStyle}
              label="Filter by Style"
              onChange={(e) => handleStyleChange(e.target.value)}
            >
              <MenuItem value="">All Styles</MenuItem>
              <MenuItem value="Renaissance">Renaissance</MenuItem>
              <MenuItem value="Post-Impressionism">Post-Impressionism</MenuItem>
              <MenuItem value="Surrealism">Surrealism</MenuItem>
              <MenuItem value="Ancient Egyptian">Ancient Egyptian</MenuItem>
            </Select>
          </FormControl>
        )}
      </Stack>

      {/* Did you mean section */}
      {suggestions.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2, borderStyle: 'dashed' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>Did you mean?</Typography>
            {suggestions.map((s, idx) => (
              <React.Fragment key={s.ArtworkID}>
                <Link to={`/artwork/${s.ArtworkID}`} style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 600 }}>
                  {s.Title}
                </Link>
                {idx < suggestions.length - 1 && ' • '}
              </React.Fragment>
            ))}
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : results.length > 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <List disablePadding>
            {results.map((artwork, index) => (
              <React.Fragment key={artwork.ArtworkID}>
                <ListItem sx={{ py: 3, px: 4 }}>
                  <ListItemText
                    primary={artwork.Title}
                    secondary={`${artwork.ArtistName} • ${artwork.MuseumName}`}
                    slotProps={{
                      primary: { sx: { fontWeight: 600, color: 'primary.main' } },
                      secondary: { sx: { color: 'text.secondary' } }
                    }}
                  />
                  <Button 
                    component={Link} 
                    to={`/artwork/${artwork.ArtworkID}`}
                    variant="contained" 
                    size="small"
                    sx={{ textTransform: 'none', borderRadius: 2, ml: 2 }}
                  >
                    View Details
                  </Button>
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : query ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No artworks found matching "{query}".
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try searching for "Mona Lisa", "Starry Night", or "Fragment".
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

export default SearchResultsPage;