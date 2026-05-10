import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = 'http://localhost:3000'; // Backend server URL

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const logSearch = (term: string) => {
    // Non-blocking fetch
    fetch(`${API_URL}/api/log-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchTerm: term }),
    }).catch((error) => {
      // Quietly log error to console, do not block user
      console.error('Failed to log search:', error);
    });
  };

  const handleSearch = () => {
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      logSearch(trimmedTerm); // Fire and forget logging
      navigate(`/search?q=${encodeURIComponent(trimmedTerm)}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for any artwork..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        sx={{
          maxWidth: 500,
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            paddingRight: '8px',
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={handleSearch} aria-label="search artwork">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

export default SearchBar;
