import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1
          }}
        >
          <Box
            component="img"
            sx={{
              height: 32,
              width: 32,
              mr: 2,
            }}
            alt="Museum Artwork Explorer Logo"
            src={logo}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            Museum Artwork Explorer
          </Typography>
        </Box>

        <Button 
          component={Link} 
          to="/favorites" 
          startIcon={<FavoriteIcon />} 
          color="inherit"
          sx={{ mr: 2, fontWeight: 700 }}
        >
          Favorites
        </Button>

        <IconButton
          size="large"
          edge="end"
          color="inherit"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
