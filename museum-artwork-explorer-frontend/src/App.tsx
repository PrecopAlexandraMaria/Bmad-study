import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResultsPage from './pages/SearchResultsPage';
import PopularSearches from './components/PopularSearches/PopularSearches';
import DailyMasterpiece from './components/DailyMasterpiece/DailyMasterpiece';
import MuseumMap from './components/MuseumMap/MuseumMap';
import TravelersLog from './components/TravelersLog/TravelersLog';
import MuseumPage from './pages/MuseumPage';
import ExhibitionPage from './pages/ExhibitionPage';
import ArtworkPage from './pages/ArtworkPage';
import ArtistPage from './pages/ArtistPage';
import AdminDashboard from './pages/AdminDashboard';
import FavoritesPage from './pages/FavoritesPage';
import { Box, Typography } from '@mui/material';
import logo from './assets/logo.png';

// Define a separate component for the homepage content
function HomePage() {
  return (
    <Box sx={{ 
      p: 4, 
      backgroundColor: 'background.default',
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pt: 10
    }}>
      <Box
        component="img"
        sx={{
          height: 80,
          width: 80,
          mb: 2,
        }}
        alt="Art Explorer Logo"
        src={logo}
      />
      <Typography variant="h3" sx={{ color: 'primary.main', mb: 1, fontWeight: 700 }}>
        Art Explorer
      </Typography>
      <Typography variant="body1" sx={{ color: 'secondary.main', mb: 4 }}>
        Discover masterpieces from around the globe.
      </Typography>
      
      <DailyMasterpiece />
      
      <SearchBar />
      <PopularSearches />
      <MuseumMap />
      <TravelersLog />
      
      <Box sx={{ 
        textAlign: 'center', 
        mt: 10,
        color: '#768A96', // Steel Blue
        maxWidth: 600,
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 4
      }}>
        <Typography variant="body2" sx={{ letterSpacing: '0.05em' }}>
          Explore a curated world of art and history.
        </Typography>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <React.Fragment>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/museum/:id" element={<MuseumPage />} />
          <Route path="/exhibition/:id" element={<ExhibitionPage />} />
          <Route path="/artwork/:id" element={<ArtworkPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>
    </React.Fragment>
  );
}

export default App;