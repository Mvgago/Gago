import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { projects } from '../../outils/projects';

export const ProjectsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  // Manejar el evento `onLoad` de cada imagen
  const handleImageLoad = () => {
    setLoadedImages((prev) => prev + 1);
  };

  // Verificar si todas las imágenes han terminado de cargarse
  useEffect(() => {
    if (loadedImages === projects.length) {
      setLoading(false);
    }
  }, [loadedImages]);

  return (
    <Box position="relative" minHeight="100vh">
      {/* Loading Spinner */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000, // Asegura que el loader esté por encima de todo
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Contenido de la página */}
      <Grid container spacing={0} sx={{ margin: 0 }}>
        {projects.map((artwork, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ padding: 0 }}>
            <Link to={artwork.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  width: '100%',
                  height: { xs: '200px', sm: '300px', md: '300px' },
                  willChange: 'transform',
                  '&:hover img': { transform: 'scale(1.03)' },
                  '&:hover .overlay': { opacity: 1 },
                }}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.2s ease',
                    willChange: 'transform',
                  }}
                  onLoad={handleImageLoad} // Detecta la carga de cada imagen
                  onContextMenu={handleContextMenu}
                  draggable={false}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    willChange: 'opacity',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Typography variant="h6">{artwork.title}</Typography>
                </Box>
              </Box>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};