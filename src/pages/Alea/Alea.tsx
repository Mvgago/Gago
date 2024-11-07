import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, Divider, Dialog, IconButton } from '@mui/material';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
    { src: portada5, alt: 'Image 3' },
    { src: portada4, alt: 'Image 4' },
    { src: portada7, alt: 'Image 5' },
    { src: portada9, alt: 'Image 6' },
    { src: portada2, alt: 'Image 7' },
    { src: portada6, alt: 'Image 8' },
];

export const AleaPage: React.FC = () => {
  const { previousProject, nextProject } = useProjectNavigation();

  // Estado para el modal de la imagen y el índice de la imagen actual
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  // Función para abrir el modal y establecer la imagen seleccionada
  const handleOpenModal = (index: number) => {
    setCurrentImageIndex(index);
    setOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setOpen(false);
    setCurrentImageIndex(null);
  };

  // Funciones de navegación para las imágenes en el modal
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex !== null ? (prevIndex + 1) % images.length : 0));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex !== null ? (prevIndex - 1 + images.length) % images.length : 0));
  };

  // Función para prevenir el clic derecho
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
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
         ALEA Casting Software provides a fast and efficient solution for precise casting charge calculations, optimizing quality at minimal cost. Developed by AMV Soluciones, it automates production and supports comprehensive planning, enhancing efficiency and accuracy.

The branding, identity design, and front-end development for ALEA were created using Figma for UI prototyping, Illustrator for custom icons, and React with Vite for a fast, responsive interface. TypeScript ensured reliability, resulting in a cohesive, high-quality product.
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
                onClick={() => handleOpenModal(index)} // Abrir modal al hacer clic
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
      </Box>

      {/* Modal para la visualización de la imagen seleccionada */}
      <Dialog open={open} onClose={handleCloseModal} maxWidth="md">
        <Box position="relative" display="flex" alignItems="center">
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: 'absolute', top: 10, right: 10, color: 'white', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Botón de navegación izquierda */}
          <IconButton
            onClick={handlePrevImage}
            sx={{ position: 'absolute', left: 10, color: 'white', zIndex: 1 }}
          >
            <ArrowBackIosIcon />
          </IconButton>

          <img
            src={currentImageIndex !== null ? images[currentImageIndex].src : ''}
            alt={currentImageIndex !== null ? images[currentImageIndex].alt : ''}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onContextMenu={handleContextMenu} // Deshabilitar clic derecho
            draggable={false} // Deshabilitar arrastre de imagen
          />

          {/* Botón de navegación derecha */}
          <IconButton
            onClick={handleNextImage}
            sx={{ position: 'absolute', right: 10, color: 'white', zIndex: 1 }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Dialog>

      <NavigationButtons previousProject={previousProject} nextProject={nextProject} />
    </Box>
  );
};