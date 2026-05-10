import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Button, IconButton, Grid, Paper, Card, CardContent, CardActionArea, Tooltip, Stack } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ExploreIcon from '@mui/icons-material/Explore';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';

const API_URL = 'http://localhost:3000';
const LONDON_CENTER: [number, number] = [51.505, -0.09];

// reliable SVG marker icon for museums
const museumIcon = L.divIcon({
  className: 'custom-museum-pin',
  html: `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#44576D" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

// reliable SVG marker for user
const userIcon = L.divIcon({
  className: 'user-location-dot',
  html: '<div style="background-color: #2196f3; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(33, 150, 243, 0.5);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

interface Museum {
  MuseumID: number;
  Name: string;
  City: string;
  FoundedYear: number;
  Latitude: number;
  Longitude: number;
}

interface MuseumWithDistance extends Museum {
  distance?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function MapController({ setMap, onLocationFound }: { setMap: (map: L.Map) => void, onLocationFound: (lat: number, lng: number, accuracy: number) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
    const handleLocFound = (e: L.LocationEvent) => onLocationFound(e.latlng.lat, e.latlng.lng, e.accuracy);
    map.on('locationfound', handleLocFound);
    return () => { map.off('locationfound', handleLocFound); };
  }, [map, setMap, onLocationFound]);
  return null;
}

function MuseumMap() {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [closestMuseums, setClosestMuseums] = useState<MuseumWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number, accuracy: number } | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/museums`)
      .then(res => res.json())
      .then(data => {
        setMuseums(data);
        setClosestMuseums(data.slice(0, 3));
      })
      .catch(err => console.error('Failed to fetch museums:', err));
  }, []);

  const handleLocationFound = useCallback((lat: number, lng: number, accuracy: number) => {
    setUserLocation({ lat, lng, accuracy });
    const sorted = museums
      .map(m => ({ ...m, distance: calculateDistance(lat, lng, m.Latitude, m.Longitude) }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setClosestMuseums(sorted.slice(0, 3));
  }, [museums]);

  const handleLocateClick = () => { if (map) map.locate({ setView: true, maxZoom: 14 }); };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, my: 6, px: 2 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
        Explore Nearby Art
      </Typography>
      
      <Paper elevation={0} sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, // Strict side-by-side on desktop
        borderRadius: '24px', 
        overflow: 'hidden', 
        border: '1px solid', 
        borderColor: 'divider', 
        boxShadow: '0 12px 40px rgba(0,0,0,0.06)' 
      }}>
        {/* MAP COMPONENT - MUST BE ON LEFT */}
        <Box sx={{ 
          flex: { md: '0 0 70%', lg: '0 0 75%' }, 
          position: 'relative', 
          height: { xs: '400px', md: '550px' },
          bgcolor: '#f0f0f0' // Fallback visibility
        }}>
          <MapContainer 
            center={LONDON_CENTER} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapController setMap={setMap} onLocationFound={handleLocationFound} />

            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
                <Circle center={[userLocation.lat, userLocation.lng]} radius={userLocation.accuracy / 2} color="#2196f3" fillOpacity={0.1} weight={1} />
              </>
            )}

            {museums.map(museum => (
              <Marker 
                key={museum.MuseumID} 
                position={[museum.Latitude, museum.Longitude]}
                icon={museumIcon} // Robust SVG Pin
              >
                <Popup minWidth={220}>
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{museum.Name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{museum.City}</Typography>
                    <Button 
                      variant="contained" size="small" fullWidth
                      onClick={() => navigate(`/museum/${museum.MuseumID}`)}
                      sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                    >View Details</Button>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <Tooltip title="Find my location">
            <IconButton 
              onClick={handleLocateClick}
              sx={{ 
                position: 'absolute', top: 20, right: 20, zIndex: 1000, 
                bgcolor: 'white', color: 'primary.main', boxShadow: 3,
                '&:hover': { bgcolor: '#f8fafc' }
              }}
            ><MyLocationIcon /></IconButton>
          </Tooltip>
        </Box>

        {/* SIDEBAR COMPONENT - MUST BE ON RIGHT */}
        <Box sx={{ 
          flex: 1, 
          p: 3, 
          bgcolor: 'white', 
          borderLeft: { md: '1px solid' }, 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, display: 'flex', alignItems: 'center' }}>
            <ExploreIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
            {userLocation ? 'Closest to You' : 'Nearby Museums'}
          </Typography>

          <Stack spacing={2}>
            {closestMuseums.map((museum) => (
              <Card 
                key={museum.MuseumID} 
                elevation={0} 
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { borderColor: 'primary.main' } }}
              >
                <CardActionArea component={Link} to={`/museum/${museum.MuseumID}`}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{museum.Name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{museum.City}</Typography>
                    {userLocation && (
                      <Box sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', px: 1, py: 0.3, borderRadius: 1.5, display: 'inline-block' }}>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>{museum.distance?.toFixed(1)} km away</Typography>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default MuseumMap;