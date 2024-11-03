import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, Divider } from '@mui/material';
import { useLocation } from 'react-router-dom';

import portada from "../../assets/peojects/buendia/buendia (1).jpg";
import portada2 from "../../assets/peojects/buendia/buendia (2).jpg";
import portada3 from "../../assets/peojects/buendia/buendia (3).jpg";
import portada4 from "../../assets/peojects/buendia/buendia (4).jpg";
import { projectRoutes } from '../../outils/projects';
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';

const images = [
  { src: portada, alt: 'Image 1' },
  { src: portada3, alt: 'Image 2' },
  { src: portada2, alt: 'Image 3' },
  { src: portada4, alt: 'Image 4' },
];

export const BuendiaPage: React.FC = () => {
  const location = useLocation();
  
  // Obtener el índice del proyecto actual
  const currentIndex = projectRoutes.indexOf(location.pathname);
  
  // Determinar los enlaces del proyecto anterior y siguiente
  const previousProject = projectRoutes[currentIndex - 1] || projectRoutes[projectRoutes.length - 1];
  const nextProject = projectRoutes[currentIndex + 1] || projectRoutes[0];
  
  return (
    <Box>

      {/* Sección de descripción del proyecto */}
      <Box
        sx={{
          padding: '60px 20px',
          background: 'linear-gradient(to bottom, #f5f5f5, #fff)',
          width: '100%',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            textAlign: 'center',
            letterSpacing: 1,
            color: '#A09586',
          }}
        >
          Buendia Travels
        </Typography>

        <Divider
          variant="middle"
          sx={{ borderColor: '#A09586', borderWidth: 1, marginY: 3 }}
        />

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            textAlign: 'justify', 
            marginX: 'auto',
            maxWidth: '800px',
            lineHeight: 1.8,
            color: '#333',
          }}
        >
          Buendia's mission was to streamline travel planning by offering unique activities, diverse guided tours, and creative excursions.
          <br />
          <br />
          Following a comprehensive analysis of Buendia’s target audience to understand their profiles, needs, and preferences, we created a new design line that modernized the brand identity with a visually compelling approach. We also updated the website to enhance user experience and implemented a digital communication strategy focused on engaging content and value-driven interactions. This revitalization strengthened client connections through impactful campaigns and memorable experiences.
        </Typography>
      </Box>

      {/* Sección de galería de imágenes */}
      <Box sx={{ padding: '40px 0', width: '100%', backgroundColor: '#fff', transition: 'background 0.5s', '&:hover': { backgroundColor: '#f0f0f0' } }}>
        <Grid container spacing={0}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ boxShadow: 3, borderRadius: 0, overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' } }}>
                <CardMedia component="img" image={image.src} alt={image.alt} sx={{ width: '100%', height: '300px', transition: 'transform 0.3s ease' }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <NavigationButtons previousProject={previousProject} nextProject={nextProject} />
    </Box>
  );
};