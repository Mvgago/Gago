import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import { Box, Container } from '@mui/material';

export const NavBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/artwork', label: 'Artwork' },
    { to: '/about', label: 'About' },
  ];

  return (
    <AppBar position="static" sx={{backgroundColor: 'white', height: '90px'}}>
      <Container maxWidth="lg"> {/* Contenedor agregado para mantener el ancho */}
      <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            height: '90px', // Establece la altura mínima del Toolbar
            display: 'flex', 
            alignItems: 'center' // Alinea verticalmente el contenido
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', flexGrow: 1 }}>
            {/* <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: 'black',  
                fontFamily: '"Sixtyfour Convergence", sans-serif' 
              }}
            >
              GAGO
            </Typography> */}

            {/* <Typography 
            variant="h6" 
            component="div" 
            sx={{color: 'black', fontFamily: 'Montserrat, sans-serif', fontWeight: 500}}
            >
                MANUGAGO
            </Typography> */}

            {/* <Typography 
            variant="h6" 
            component="div" 
            className="rubik-80s-fade-regular" 
            sx={{ color: 'black', textTransform: 'none' }} // Solo el color y la transformación
            >
            MANUGAGO
            </Typography> */}

            {/* <Typography 
                variant="h6" 
                component="div" 
                sx={{ color: 'black', fontFamily: 'Syne, sans-serif', fontWeight: 400 }}
            >
                MANUGAGO
            </Typography> */}

            {/* <Typography 
                variant="h6" 
                component="div" 
                sx={{ color: 'black', fontFamily: '"Rock 3D", system-ui', fontWeight: 700 }}
                >
                MANUGAGO
            </Typography> */}

            <Typography variant="h6" component="div" sx={{ color: 'black', fontFamily: '"Michroma", sans-serif', fontWeight: 600 }}>
                MANUGAGO
            </Typography>

            {/* <Typography 
                variant="h6" 
                component="div" 
                sx={{ color: 'black', fontFamily: '"Orbitron", sans-serif', fontWeight: 600 }}
                >
                MANUGAGO
            </Typography> */}

     
          </Link>

          {/* Botón de menú hamburguesa para dispositivos móviles */}
          <IconButton
            size="large"
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
            sx={{ display: { xs: 'block', md: 'none' }, color: '#D4CDC3'}} // Mostrar solo en pantallas pequeñas
          >
            <MenuIcon />
          </IconButton>

          {/* Menú de navegación para pantallas grandes */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 6 }}>
            {navLinks.map((link) => (
                <Button key={link.to} component={Link} to={link.to} sx={{color: 'black', fontFamily: 'Montserrat, sans-serif', fontWeight: 500,  textTransform: 'none',  '&:hover': {
                    color: '#A09586', // Cambia a tu color deseado aquí
                  },}}>
                {link.label}
                </Button>
            ))}
        </Box>

          {/* Menú hamburguesa */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Button component={Link} to="/" sx={{ color: 'black' }}>
                Home
              </Button>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Button component={Link} to="/projects" sx={{ color: 'black' }}>
                Projects
              </Button>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Button component={Link} to="/artwork" sx={{ color: 'black' }}>
                Artwork
              </Button>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Button component={Link} to="/about" sx={{ color: 'black' }}>
                About
              </Button>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};