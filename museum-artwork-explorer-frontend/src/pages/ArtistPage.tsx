import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Paper, Stack, Breadcrumbs } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TriviaSnaps from '../components/TriviaSnaps/TriviaSnaps';
import { useTravelHistory } from '../hooks/useTravelHistory';

const API_URL = 'http://localhost:3000';

interface Artwork {
  ArtworkID: number;
  Title: string;
  YearCreated: number;
  MuseumName: string;
}

interface Artist {
  ArtistID: number;
  FullName: string;
  Country: string;
  BirthYear: number;
  DeathYear: number;
  artworks: Artwork[];
}

interface WikiData {
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop: { page: string } };
}

function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [wikiData, setWikiData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);
  const { logVisit } = useTravelHistory();

  useEffect(() => {
    fetch(`${API_URL}/api/artists/${id}`)
      .then(res => res.json())
      .then(data => {
        setArtist(data);
        setLoading(false);
        if (data) {
          logVisit({ id: data.ArtistID, type: 'Artist', name: data.FullName, url: `/artist/${data.ArtistID}` });
        }
        // Fetch Wikipedia summary
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.FullName)}`)
          .then(res => res.ok ? res.json() : null)
          .then(wiki => setWikiData(wiki))
          .catch(() => setWikiData(null));
      })
      .catch(err => {
        console.error('Failed to fetch artist details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Typography sx={{ p: 4 }}>Loading artist portfolio...</Typography>;
  if (!artist) return <Typography sx={{ p: 4 }}>Artist not found.</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Typography color="text.primary">{artist.FullName}</Typography>
      </Breadcrumbs>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {artist.FullName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PublicIcon sx={{ mr: 1, fontSize: 20, opacity: 0.7 }} />
            <Typography variant="body1">{artist.Country}</Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {artist.BirthYear} — {artist.DeathYear || 'Present'}
          </Typography>
        </Stack>
      </Paper>

      {wikiData && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {wikiData.thumbnail && (
            <Box 
              component="img" 
              src={wikiData.thumbnail.source} 
              sx={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 2, display: { xs: 'none', sm: 'block' } }} 
            />
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, letterSpacing: '0.1em' }}>
              Biography (from Wikipedia)
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
              {wikiData.extract}
            </Typography>
            {wikiData.content_urls && (
              <Button 
                href={wikiData.content_urls.desktop.page} 
                target="_blank" 
                size="small"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Read more on Wikipedia
              </Button>
            )}
          </Box>
        </Paper>
      )}

      <TriviaSnaps entityType="Artist" entityId={artist.ArtistID} />
      <Box sx={{ my: 4 }} />

      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Portfolio in this Collection
      </Typography>

      {artist.artworks.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
          gap: 3 
        }}>
          {artist.artworks.map((artwork) => (
            <Card key={artwork.ArtworkID} sx={{ 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: '0.2s' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {artwork.Title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {artwork.YearCreated} • {artwork.MuseumName}
                </Typography>
                <Button 
                  component={Link} 
                  to={`/artwork/${artwork.ArtworkID}`}
                  variant="outlined" 
                  size="small"
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">No artworks by this artist are currently in our system.</Typography>
      )}
    </Box>
  );
}

export default ArtistPage;