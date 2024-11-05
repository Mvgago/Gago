import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import portada from "../../assets/gallery/single3.png";
import portada6 from "../../assets/gallery/single4.png";
import portada2 from "../../assets/gallery/lerele1.jpg";
import portada3 from "../../assets/gallery/Otoño.jpg";
import portada4 from "../../assets/gallery/CLARO2.png";
import portada5 from "../../assets/gallery/untitlezdfdsd.png";
import portada8 from "../../assets/gallery/summer2003.png";
import portada9 from "../../assets/gallery/acne2.png";

// import portada from "../../assets/gallery/single3.png";
// import portada from "../../assets/gallery/single3.png";
// import portada from "../../assets/gallery/single3.png";

const images = [
  { id: 6, url: portada6},
  { id: 1, url: portada},
  { id: 2, url: portada2},
  { id: 3, url: portada3},
  { id: 4, url: portada4},
  { id: 4, url: portada5},
  { id: 8, url: portada8},
  // { id: 7, url: portada7},
  { id: 9, url: portada9},
];

export const ArtworkPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Box sx={{ width: '80%', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
    <Typography variant="h4" gutterBottom sx={{my: 4}}>
      Artwork Gallery
    </Typography>

    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: 3,
        height: '700px', // Altura fija para el contenedor del carrusel
      }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={images[currentIndex].id}
          src={images[currentIndex].url}
          // alt={images[currentIndex].title}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '50%',
            height: '100%',            // Asegura que la imagen ocupe todo el alto del contenedor
            objectFit: 'cover',         // Ajusta la imagen sin deformarla
            objectPosition: 'center',   // Centra la imagen
          }}
        />
      </AnimatePresence>

      {/* Botones de navegación */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          transform: 'translateY(-50%)',
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.3)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.3)',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
    <Typography variant="h6" sx={{ mt: 2 }}>
      {/* {images[currentIndex].title} */}
    </Typography>
  </Box>
  );
};