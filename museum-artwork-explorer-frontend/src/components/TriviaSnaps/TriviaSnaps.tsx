import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const API_URL = 'http://localhost:3000';

interface Trivia {
  Fact: string;
}

interface TriviaSnapsProps {
  entityType: 'Museum' | 'Artist' | 'Artwork';
  entityId: number;
}

function TriviaSnaps({ entityType, entityId }: TriviaSnapsProps) {
  const [trivia, setTrivia] = useState<Trivia[]>([]);
  const [currentFact, setCurrentFact] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/trivia/${entityType}/${entityId}`)
      .then(res => res.json())
      .then(data => {
        setTrivia(data);
        if (data.length > 0) {
          // Pick a random fact from the ones returned
          setCurrentFact(data[Math.floor(Math.random() * data.length)].Fact);
        }
      })
      .catch(err => console.error('Failed to fetch trivia:', err));
  }, [entityType, entityId]);

  if (!currentFact) return null;

  return (
    <Fade in={true} timeout={800}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          borderRadius: 4, 
          bgcolor: 'rgba(118, 138, 150, 0.05)', // Steel Blue light
          border: '1px dashed',
          borderColor: 'secondary.main',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <InfoIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Did you know?
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: '#44576D' }}>
          "{currentFact}"
        </Typography>
      </Paper>
    </Fade>
  );
}

export default TriviaSnaps;
