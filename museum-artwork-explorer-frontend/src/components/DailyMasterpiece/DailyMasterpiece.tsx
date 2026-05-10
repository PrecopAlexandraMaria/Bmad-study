import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CardActionArea, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

interface Artwork {
  ArtworkID: number;
  Title: string;
  ArtistName: string;
  YearCreated: number;
}

function DailyMasterpiece() {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Daily Masterpiece: Fetching from dedicated endpoint...');
    fetch(`${API_URL}/api/daily-masterpiece`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Daily Masterpiece Received:', data);
        // Direct object response from the new endpoint
        if (data && data.ArtworkID) {
          setArtwork(data);
        } else if (data && data.results && data.results.length > 0) {
          // Fallback if it hits the old search endpoint
          const artworks = data.results;
          const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          setArtwork(artworks[dayOfYear % artworks.length]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Daily Masterpiece Error:', err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Box sx={{ mb: 6 }}><CircularProgress size={24} /></Box>;
  if (!artwork) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: '100%', 
        maxWidth: 600, 
        mb: 6, 
        borderRadius: 4, 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'primary.light',
        bgcolor: 'rgba(68, 87, 109, 0.03)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' }
      }}
    >
      <CardActionArea component={Link} to={`/artwork/${artwork.ArtworkID}`}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 80
            }}
          >
            <AutoAwesomeIcon sx={{ mb: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Daily</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="secondary.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
              Featured Masterpiece
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
              {artwork.Title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              By {artwork.ArtistName}, {artwork.YearCreated}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Paper>
  );
}

export default DailyMasterpiece;
