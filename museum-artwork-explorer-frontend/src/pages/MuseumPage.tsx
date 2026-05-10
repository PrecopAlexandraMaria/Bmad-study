import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Paper, Stack, Grid, CircularProgress, CardActionArea } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TriviaSnaps from '../components/TriviaSnaps/TriviaSnaps';
import { useTravelHistory } from '../hooks/useTravelHistory';

const API_URL = 'http://localhost:3000';

function MuseumPage() {
  const { id } = useParams<{ id: string }>();
  const [museum, setMuseum] = useState<any | null>(null);
  const [wikiData, setWikiData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logVisit } = useTravelHistory();

  useEffect(() => {
    if (!id) {
      setError('Missing Museum ID in URL');
      setLoading(false);
      return;
    }

    console.log(`[MuseumPage] Attempting to load ID: ${id}`);
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/museums/${id}`)
      .then(res => {
        console.log(`[MuseumPage] API Status: ${res.status}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('[MuseumPage] Data received:', data);
        if (!data || !data.Name) throw new Error('Museum record is empty or invalid.');
        
        setMuseum(data);
        
        // Wrap logVisit in try-catch to prevent total page failure
        try {
          logVisit({ id: Number(data.MuseumID), type: 'Museum', name: data.Name, url: `/museum/${data.MuseumID}` });
        } catch (logErr) {
          console.warn('[MuseumPage] Visit logging failed, but continuing...', logErr);
        }
        
        // Wiki Fetch (Silent)
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data.Name)}`)
          .then(res => res.ok ? res.json() : null)
          .then(wiki => setWikiData(wiki))
          .catch(() => console.warn('[MuseumPage] Wiki enrichment skipped.'));
          
        setLoading(false);
      })
      .catch(err => {
        console.error('[MuseumPage] Error:', err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [id, logVisit]);

  // Total Component Error Boundary (Simulated via return)
  try {
    if (loading) return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">Opening the vault...</Typography>
      </Box>
    );

    if (error || !museum) return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>Gallery Unavailable</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {error || 'The requested museum could not be found.'}
        </Typography>
        <Button component={Link} to="/" variant="contained">Return to Lobby</Button>
      </Box>
    );

    const artworks = Array.isArray(museum.artworks) ? museum.artworks : [];
    const exhibitions = Array.isArray(museum.exhibitions) ? museum.exhibitions : [];

    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', mb: 6, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            {museum.Name}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <LocationCityIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">{museum.City || 'International'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="body2">Founded {museum.FoundedYear || 'N/A'}</Typography>
            </Box>
          </Stack>

          {wikiData && (
            <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              {wikiData.thumbnail && (
                <Box 
                  component="img" 
                  src={wikiData.thumbnail.source} 
                  sx={{ width: 180, borderRadius: 3, display: { xs: 'none', sm: 'block' }, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} 
                />
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.1em' }}>
                  History
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{wikiData.extract}</Typography>
              </Box>
            </Box>
          )}
        </Paper>

        <Grid container spacing={6}>
          <Grid item xs={12} md={7}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Collection Highlights ({artworks.length})</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {artworks.map((art: any) => (
                <Card key={art.ArtworkID} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardActionArea component={Link} to={`/artwork/${art.ArtworkID}`}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{art.Title}</Typography>
                      <Typography variant="body2" color="text.secondary">{art.ArtistName}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Exhibitions & Trivia</Typography>
            <Stack spacing={3}>
              {exhibitions.map((ex: any) => (
                <Card key={ex.ExhibitionID} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{ex.Name}</Typography>
                    <Typography variant="body2" color="text.secondary">{ex.StartDate} — {ex.EndDate}</Typography>
                  </CardContent>
                </Card>
              ))}
              <TriviaSnaps entityType="Museum" entityId={Number(id)} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  } catch (renderErr: any) {
    console.error('[MuseumPage] Crash during render:', renderErr);
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Display Error</Typography>
        <Typography variant="body2">The gallery content is incompatible with the current viewer.</Typography>
        <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', textAlign: 'left' }}>
          <code>{renderErr.message}</code>
        </Paper>
      </Box>
    );
  }
}

export default MuseumPage;
