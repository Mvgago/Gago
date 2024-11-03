import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Divider,
  Link,
} from '@mui/material';

import portada from "../../assets/peojects/santa/santa (1).jpg";
import portada2 from "../../assets/peojects/santa/santa (2).jpg";
import portada3 from "../../assets/peojects/santa/santa (3).jpg";
import portada4 from "../../assets/peojects/santa/santa (4).jpg";
import portada5 from "../../assets/peojects/santa/santa (5).jpg";
import portada6 from "../../assets/peojects/santa/santa (6).jpg";
import portada7 from "../../assets/peojects/santa/santa (7).jpg";
import portada8 from "../../assets/peojects/santa/santa (8).jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';


const images = [
    { src: portada7, alt: 'Image 6' },
    { src: portada4, alt: 'Image 4' },
    { src: portada6, alt: 'Image 6' },
    { src: portada8, alt: 'Image 2' },
    // { src: portada, alt: 'Image 1' },
    { src: portada3, alt: 'Image 4' },
    { src: portada5, alt: 'Image 6' },
    { src: portada2, alt: 'Image 2' },
];

export const SantaPage: React.FC = () => {

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
          Santa Engracia
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
          SANTA ENGRACIA is a distinctive building in Chamberí, Madrid, renowned for its arched chamfer, naturalistic façade ornamentation, and striking dome. The brand identity for Santa Engracia captures the essence of the building, emphasizing minimalist and elegant lines. The concept transforms the ornate aesthetics of this classic Madrid structure into a modern, refined image that aligns with contemporary design trends, promoting a lifestyle centered on simplicity and sophistication.
        </Typography>
      </Box>

      {/* Sección de galería de imágenes */} 
      <Box
        sx={{
          padding: '0px',
          width: '100%',
          backgroundColor: '#fff',
          transition: 'background 0.5s',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        }}
      >
        {images.map((image, index) => (
          <Card
            key={index}
            sx={{
              boxShadow: 0,
              borderRadius: 0,
              overflow: 'hidden',
              marginBottom: '0px',
            }}
          >
            <CardMedia
              component="img"
              image={image.src}
              alt={image.alt}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Card>
        ))}
      </Box>
      {/* Links a las secciones */}
      <NavigationButtons previousProject={previousProject} nextProject={nextProject} />

    </Box>
  );
};