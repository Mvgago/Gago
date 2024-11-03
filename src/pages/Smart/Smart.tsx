import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Divider,
} from '@mui/material';

import portada from "../../assets/peojects/smart/smart (1).png";
import portada2 from "../../assets/peojects/smart/smart.png";
import portada3 from "../../assets/peojects/smart/smart (2).jpg";
import portada4 from "../../assets/peojects/smart/smart.jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';


const images = [
  { src: portada, alt: 'Image 1' },
  { src: portada3, alt: 'Image 2' },
  { src: portada2, alt: 'Image 2' },
  { src: portada4, alt: 'Image 4' },
];

export const SmartPage: React.FC = () => {

  const { previousProject, nextProject } = useProjectNavigation();

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
          Smart Human Capital
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
          SmartHC is a Spanish consulting firm specialized in security and new technologies. During the branding update, my key contribution was to develop a modern visual identity that reflected the essence of the company. I created 3D designs focused on cybersecurity to effectively communicate complex concepts and enhance the connection with customers. In addition, I implemented digital marketing campaigns that highlighted the importance of cybersecurity, thus strengthening SmartHC's presence in the Spanish market.
        </Typography>
      </Box>

      {/* Sección de galería de imágenes */}
      <Box
        sx={{
          padding: '40px 0',
          width: '100%',
          backgroundColor: '#fff',
          transition: 'background 0.5s',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        }}
      >

        <Grid container spacing={0}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 0,
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={image.src}
                  alt={image.alt}
                  sx={{
                    width: '100%',
                    height: '300px',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Links a las secciones */}
        <NavigationButtons previousProject={previousProject} nextProject={nextProject} />

      </Box>
    </Box>
  );
};