import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Divider,
} from '@mui/material';

import portada from "../../assets/peojects/saphire/saphire (1).jpg";
import portada2 from "../../assets/peojects/saphire/saphire (2).jpg";
import portada4 from "../../assets/peojects/saphire/saphire (4).jpg";
import portada6 from "../../assets/peojects/saphire/saphire (6).jpg";
import portada8 from "../../assets/peojects/saphire/saphire (8).jpg";
import portada9 from "../../assets/peojects/saphire/saphire (9).jpg";
import portada10 from "../../assets/peojects/saphire/saphire (10).jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';


const images = [
  { src: portada, alt: 'Image 1' },
  { src: portada2, alt: 'Image 2' },
  { src: portada4, alt: 'Image 4' },
  { src: portada6, alt: 'Image 6' },
  { src: portada8, alt: 'Image 2' },
  { src: portada9, alt: 'Image 4' },
  { src: portada10, alt: 'Image 6' },
];

export const SapphirePage: React.FC = () => {

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
          The Sapphire
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
        The Sapphire project by Darya Homes is an exclusive beachfront development on the Costa del Sol, featuring 12 luxury homes for high-net-worth clients. I led the branding, website design, and collaborated on 3D imagery. The brand identity focuses on concepts like light, clarity, and exclusivity, capturing the essence of the project’s high-end and modern design. Drawing inspiration from the blue sapphire, the branding reflects rarity and a timeless refined character.
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
              position: 'relative', // Añadir posición relativa para superponer el overlay
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
                userSelect: 'none', // Desactivar selección
                pointerEvents: 'none', // Desactivar clics
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