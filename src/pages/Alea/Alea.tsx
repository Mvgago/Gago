import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, Divider } from '@mui/material';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';

import portada from "../../assets/peojects/alea/alea (1) - copia.png";
import portada2 from "../../assets/peojects/alea/alea8.png";
import portada3 from "../../assets/peojects/alea/alea (3).png";
import portada4 from "../../assets/peojects/alea/alea.png";
import portada5 from "../../assets/peojects/alea/alea3.png";
import portada6 from "../../assets/peojects/alea/alea (2).png";
import portada7 from "../../assets/peojects/alea/alea7.jpeg";
import portada9 from "../../assets/peojects/alea/alea9.png";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';

const images = [
    { src: portada, alt: 'Image 1' },
    { src: portada3, alt: 'Image 2' },
    { src: portada5, alt: 'Image 1' },
    { src: portada4, alt: 'Image 4' },
    { src: portada7, alt: 'Image 4' },
    { src: portada9, alt: 'Image 2' },
    { src: portada2, alt: 'Image 2' },
    { src: portada6, alt: 'Image 2' },
];

export const AleaPage: React.FC = () => {

  const { previousProject, nextProject } = useProjectNavigation();

  // Función para manejar el clic derecho
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();  // Deshabilita el clic derecho
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
          Alea Software
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
          ALEA Casting Software provides a fast, streamlined solution for precise casting charge calculations, ensuring maximum quality at minimal cost. It enables real-time casting optimization, automates production, and supports comprehensive casting planning. Developed by AMV Soluciones, ALEA stands out for enhancing efficiency and accuracy throughout the casting process. <br /><br />
          Led branding, identity design, and front-end development for ALEA. Figma streamlined UI prototyping, Illustrator crafted custom icons, while React and Vite built a responsive, fast interface. TypeScript ensured reliability, resulting in a cohesive, high-quality product.
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
                    '&:hover': { transform: 'scale(1.1)' },  // Mantén el hover en la imagen
                  }}
                  onContextMenu={handleContextMenu} // Deshabilitar clic derecho
                  draggable={false} // Deshabilitar arrastre de imagen
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