import React from 'react';
import { Box, IconButton, Link } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';

interface NavigationButtonsProps {
  previousProject: string;
  nextProject: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ previousProject, nextProject }) => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Sección de navegación con enlaces centrados */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px',
        }}
      >
        <IconButton
          onClick={() => navigate(previousProject)}
          aria-label="Anterior proyecto"
          sx={{ position: 'absolute', left: 0 }}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link
            href="/projects"
            color="inherit"
            underline="hover"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px',
              color: '#A09586',
              '&:hover': { color: '#A09586' },
            }}
          >
            Projects
          </Link>
          <Link
            href="/artwork"
            color="inherit"
            underline="hover"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px',
              color: '#A09586',
              '&:hover': { color: '#A09586' },
            }}
          >
            Artwork
          </Link>
          <Link
            href="/about"
            color="inherit"
            underline="hover"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px',
              color: '#A09586',
              '&:hover': { color: '#A09586' },
            }}
          >
            About
          </Link>
        </Box>

        <IconButton
          onClick={() => navigate(nextProject)}
          aria-label="Siguiente proyecto"
          sx={{ position: 'absolute', right: 0 }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
};