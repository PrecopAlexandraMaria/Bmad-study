import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (termToSearch?: string) => {
    const targetTerm = (termToSearch || searchTerm).trim();
    if (targetTerm) {
      navigate(`/search?q=${encodeURIComponent(targetTerm)}`);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, my: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for any artwork..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyPress={(e: KeyboardEvent) => e.key === 'Enter' && handleSearch()}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF', 
            '& fieldset': { borderColor: '#768A96' }, // Steel Blue
            '&:hover fieldset': { borderColor: '#44576D' }, // Muted Navy
            '&.Mui-focused fieldset': { borderColor: '#29353C' }, // Deep Slate
          },
          '& input': { color: '#29353C' }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => handleSearch()} sx={{ color: '#44576D' }}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }
        }}
      />
    </Box>
  );
}

export default SearchBar;
