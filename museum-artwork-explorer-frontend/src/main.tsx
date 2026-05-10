import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#29353C', // Deep Slate
    },
    secondary: {
      main: '#44576D', // Muted Navy
    },
    background: {
      default: '#E6E6E6', // Light Gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#29353C',
      secondary: '#44576D',
    },
    divider: '#AAC7D8', // Sky Blue
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#29353C',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: '#768A96',
          color: '#44576D',
          '&:hover': {
            backgroundColor: '#DFEBF6',
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);