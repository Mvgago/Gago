// Footer.tsx
import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Link,
  Box,
} from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#242424', // Fondo oscuro
        color: '#ffffff',
        padding: '40px 20px',
        marginTop: 'auto', // Asegura que el footer esté al final
      }}
    >
        <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center'}}>
        
        {/* Primer Grid Item */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Typography variant="h6" component="div" sx={{ color: 'white', fontFamily: '"Michroma", sans-serif', fontWeight: 600, textAlign: 'center' }}>
              MANUGAGO
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
              UI/UX 3D Designer
            </Typography>
            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                <Link href="/projects" color="inherit" underline="hover" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Projects
                </Link>
                <br />
                <Link href="/artwork" color="inherit" underline="hover" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Artwork
                </Link>
                <br />
                <Link href="/about" color="inherit" underline="hover" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                  About
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Segundo Grid Item */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>
              Let's work together
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', textAlign: 'center' }}>
              Always welcome to discuss new projects and opportunities. Let’s connect!
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', textAlign: 'center' }}>
              <Link href="mailto:mvgago26@gmail.com" color="inherit">
                mvgago26@gmail.com
              </Link>
            </Typography>
          </Box>
        </Grid>

      </Grid>
    </Container>
    </Box>
  );
};

export default Footer;