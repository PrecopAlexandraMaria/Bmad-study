import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Paper, Divider, Breadcrumbs, Stack, IconButton, Button } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MuseumIcon from '@mui/icons-material/AccountBalance';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../hooks/useFavorites';
import { useTravelHistory } from '../hooks/useTravelHistory';
import TriviaSnaps from '../components/TriviaSnaps/TriviaSnaps';

const API_URL = 'http://localhost:3000';

interface Artwork {
  ArtworkID: number;
  ArtistID: number;
  MuseumID: number;
  Title: string;
  ArtistName: string;
  ArtistCountry: string;
  StyleName: string;
  YearCreated: number;
  RoomName: string;
  RoomFloor: number;
  MuseumName: string;
}

interface WikiData {
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop: { page: string } };
}

function ArtworkPage() {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { logVisit } = useTravelHistory();

  useEffect(() => {
    fetch(`${API_URL}/api/artworks/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Artwork Data Loaded:', data);
        console.log('Target Museum ID:', data?.MuseumID);
        setArtwork(data);
        setLoading(false);
        if (data) {
          logVisit({ id: data.ArtworkID, type: 'Artwork', name: data.Title, url: `/artwork/${data.ArtworkID}` });
          // Fetch Wikipedia summary
          fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.Title)}`)
            .then(res => res.ok ? res.json() : null)
            .then(wiki => setWikiData(wiki))
            .catch(() => setWikiData(null));
        }
      })
      .catch(err => {
        console.error('Failed to fetch artwork details:', err);
        setLoading(false);
      });
  }, [id, logVisit]);

  if (loading) return <Typography sx={{ p: 4 }}>Loading artwork details...</Typography>;
  if (!artwork) return <Typography sx={{ p: 4 }}>Artwork not found.</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Typography color="text.primary">{artwork.Title}</Typography>
      </Breadcrumbs>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 4, bgcolor: 'primary.main', color: 'white', position: 'relative' }}>
          <Box sx={{ pr: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {artwork.Title}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {artwork.ArtistName}, {artwork.YearCreated}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => toggleFavorite(artwork.ArtworkID)}
            sx={{ 
              position: 'absolute', 
              top: 24, 
              right: 24, 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            {isFavorite(artwork.ArtworkID) ? <FavoriteIcon sx={{ color: '#ff4081' }} /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>

        {wikiData && (
          <Box sx={{ p: 3, bgcolor: '#fdfdfd', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {wikiData.thumbnail && (
              <Box 
                component="img" 
                src={wikiData.thumbnail.source} 
                sx={{ width: 140, borderRadius: 2, display: { xs: 'none', sm: 'block' }, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
            )}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, letterSpacing: '0.1em' }}>
                About this Work
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                {wikiData.extract}
              </Typography>
              {wikiData.content_urls && (
                <Button 
                  href={wikiData.content_urls.desktop.page} 
                  target="_blank" 
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  View on Wikipedia
                </Button>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 4 
          }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                Artist Info
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
                  <Typography variant="body1">
                    <Link to={`/artist/${artwork.ArtistID}`} style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 700 }}>
                      {artwork.ArtistName}
                    </Link>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryEduIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
                  <Typography variant="body1">{artwork.StyleName || 'General Style'}</Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                Precise Location
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f9f9f9' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RoomIcon sx={{ mr: 1.5, color: 'error.main' }} />
                    <Typography variant="body1"><strong>{artwork.RoomName || 'Main Gallery'}</strong></Typography>
                  </Box>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    Floor: <strong>{artwork.RoomFloor}</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MuseumIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                    <Link to={`/museum/${artwork.MuseumID}`} style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.875rem' }}>
                      {artwork.MuseumName}
                    </Link>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.primary', mb: 4 }}>
            This masterpiece is currently on display at <Link to={`/museum/${artwork.MuseumID}`} style={{ color: 'primary.main', fontWeight: 700 }}>{artwork.MuseumName}</Link>. 
            Follow the signage to <strong>{artwork.RoomName}</strong> on the <strong>{artwork.RoomFloor}{getOrdinal(artwork.RoomFloor)} floor</strong> to view it in person.
          </Typography>

          <TriviaSnaps entityType="Artwork" entityId={artwork.ArtworkID} />
        </Box>
      </Paper>
    </Box>
  );
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = Math.abs(n) % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default ArtworkPage;