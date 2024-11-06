import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Divider,
} from '@mui/material';

import portada from "../../assets/img/annet.jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';

// Array de imágenes
const images = [
  { src: portada, alt: 'Image 1' },
];

export const AnnetPage: React.FC = () => {

  const { previousProject, nextProject } = useProjectNavigation();

  // Función para deshabilitar el clic derecho
  const disableRightClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita la acción por defecto del clic derecho
  };

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
          Annet
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
          Annet is a versatile artist, poet, actress, and writer, driven by a deep fascination with the human experience. She views creation as a nourishing substance, where poetry is the essential "bread" that underpins all her work. Her artistic journey blends various mediums, from spoken word to theater and music, reflecting her belief that art, much like food, should be savored.
          <br />
          <br />
          Annet commissioned me to design the cover for her first two singles, including "Piel de Serpiente" (snakeskin), merging photography and 3D design with her poetic vision. The visuals create an engaging experience that connects sound and sight.
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
              display: 'flex',
              justifyContent: 'center',
              position: 'relative', // Necesario para superponer la capa de protección
            }}
            onContextMenu={disableRightClick} // Deshabilitar clic derecho
          >
            <CardMedia
              component="img"
              image={image.src}
              alt={image.alt}
              sx={{
                width: '50%',
                height: 'auto',
                display: 'block',
                userSelect: 'none', // Deshabilitar selección de la imagen
                pointerEvents: 'none', // Deshabilitar eventos del ratón sobre la imagen
              }}
            />
            {/* Capa de overlay para protección */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0)', // Capa semi-transparente
                zIndex: 1,
              }}
            />
          </Card>
        ))}
      </Box>

      {/* Navegación entre proyectos */}
      <NavigationButtons previousProject={previousProject} nextProject={nextProject} />
    </Box>
  );
};