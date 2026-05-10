import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, Button, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const API_URL = 'http://localhost:3000';

interface Artwork {
  ArtworkID: number;
  Title: string;
  ArtistName: string;
  YearCreated: number;
}

interface Exhibition {
  ExhibitionID: number;
  Name: string;
  MuseumName: string;
  MuseumID: number;
  StartDate: string;
  EndDate: string;
  artworks: Artwork[];
}

function ExhibitionPage() {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/exhibitions/${id}`)
      .then(res => res.json())
      .then(data => {
        setExhibition(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch exhibition details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Typography sx={{ p: 4 }}>Loading exhibition details...</Typography>;
  if (!exhibition) return <Typography sx={{ p: 4 }}>Exhibition not found.</Typography>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Link to={`/museum/${exhibition.MuseumID}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {exhibition.MuseumName}
        </Link>
        <Typography color="text.primary">{exhibition.Name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
        {exhibition.Name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Hosted by <strong>{exhibition.MuseumName}</strong> • {exhibition.StartDate} to {exhibition.EndDate}
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Artworks in this Exhibition
      </Typography>

      {exhibition.artworks.length > 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <List disablePadding>
            {exhibition.artworks.map((artwork, index) => (
              <Box key={artwork.ArtworkID}>
                <ListItem sx={{ py: 3, px: 4 }}>
                  <ListItemText
                    primary={artwork.Title}
                    secondary={`${artwork.ArtistName} • ${artwork.YearCreated}`}
                    slotProps={{
                      primary: { 
                        variant: 'h6', 
                        sx: { fontWeight: 600, color: 'primary.main' } 
                      },
                      secondary: { 
                        variant: 'body2' 
                      }
                    }}
                  />
                  <Button 
                    component={Link} 
                    to={`/artwork/${artwork.ArtworkID}`}
                    variant="text" 
                    size="small"
                    sx={{ textTransform: 'none', ml: 2 }}
                  >
                    View Details
                  </Button>
                </ListItem>
                {index < exhibition.artworks.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography color="text.secondary">No artworks currently listed for this exhibition.</Typography>
      )}
    </Box>
  );
}

export default ExhibitionPage;