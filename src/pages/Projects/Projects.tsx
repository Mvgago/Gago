import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';  // Importa Link
import { projects } from '../../outils/projects';

export const ProjectsPage: React.FC = () => {
  return (
    <Box>
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
                  '&:hover img': { transform: 'scale(1.1)' },
                  '&:hover .overlay': { opacity: 1 },
                }}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
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
                    transition: 'opacity 0.3s ease',
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