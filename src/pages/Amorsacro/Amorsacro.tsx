import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Divider,
} from '@mui/material';

import portada from "../../assets/img/amorsacro.jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';



const images = [
  { src: portada, alt: 'Image 1' },
];

export const AmorsacroPage: React.FC = () => {

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
          AMORSACRO
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
            "AMORSACRO", is a digital illustration inspired by an old painting that I saw in Strasbourg, France. This design blends nostalgia with an imperial, snow-covered landscape, where classical elements coexist with vibrant, modern, psychedelic patterns. The interplay of textures and colors invites viewers to immerse themselves in a surreal experience, evoking a sense of wonder and depth.          <br />
                    <br />
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
              justifyContent: 'center'
            }}
          >
            <CardMedia
              component="img"
              image={image.src}
              alt={image.alt}
              sx={{
                width: '50%',
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