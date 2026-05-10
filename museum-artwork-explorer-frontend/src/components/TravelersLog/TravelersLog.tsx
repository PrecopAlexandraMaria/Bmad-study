import { Box, Typography, Chip, Paper } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useTravelHistory } from '../../hooks/useTravelHistory';
import { Link } from 'react-router-dom';

function TravelersLog() {
  const { history } = useTravelHistory();

  if (history.length === 0) return null;

  return (
    <Box sx={{ width: '100%', mt: 8, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
        <HistoryIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Your Traveler's Log
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {history.map((item, idx) => (
          <Chip
            key={`${item.type}-${item.id}-${idx}`}
            label={`${item.type}: ${item.name}`}
            component={Link}
            to={item.url}
            clickable
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: '#f0f4f8', borderColor: 'primary.main' }
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default TravelersLog;
