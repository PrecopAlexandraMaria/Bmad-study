import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useFavorites } from '../hooks/useFavorites';

const API_URL = 'http://localhost:3000';

interface Artwork {
  ArtworkID: number;
  Title: string;
  ArtistName: string;
  YearCreated: number;
  MuseumName: string;
}

function FavoritesPage() {
  const { favorites } = useFavorites();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all artworks and filter by favorites locally
    fetch(`${API_URL}/api/search/artworks?q=`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((a: Artwork) => favorites.includes(a.ArtworkID));
        setArtworks(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch favorite artworks:', err);
        setLoading(false);
      });
  }, [favorites]);

  if (loading) return <Typography sx={{ p: 4 }}>Loading favorites...</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'primary.main' }}>
        My Favorite Masterpieces
      </Typography>

      {artworks.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You haven't saved any favorites yet.
          </Typography>
          <Typography variant="body1">
            Browse artworks and click the heart icon to save them here!
          </Typography>
          <Link to="/" style={{ display: 'inline-block', marginTop: '24px', fontWeight: 700, color: '#44576D' }}>
            Back to Home
          </Link>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {artworks.map((artwork) => (
            <Grid item xs={12} sm={6} md={4} key={artwork.ArtworkID}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardActionArea component={Link} to={`/artwork/${artwork.ArtworkID}`}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, noWrap: true }}>
                      {artwork.Title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {artwork.ArtistName}, {artwork.YearCreated}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, display: 'block', mt: 1 }}>
                      {artwork.MuseumName}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FavoritesPage;
