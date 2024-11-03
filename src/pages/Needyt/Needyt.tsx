import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Divider,
  Link,
} from '@mui/material';

import portada from "../../assets/peojects/needyt/needyt.jpg";
import portada2 from "../../assets/peojects/needyt/needyt (1).jpg";
import portada3 from "../../assets/peojects/needyt/needyt (2).jpg";
import portada4 from "../../assets/peojects/needyt/needyt4.jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';

const images = [
    { src: portada2, alt: 'Image 2' },
    { src: portada, alt: 'Image 1' },
    { src: portada3, alt: 'Image 2' },
  { src: portada4, alt: 'Image 4' },
];

export const NeedytPage: React.FC = () => {

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
          Needyt
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
          Needyt is a collaborative trading platform that tries to avoid the exaggerated consumption of our time. To do this, it allows its users the possibility of renting products that can be useful for other people. In this way, the products can have a second life in other hands, generating a profit for their owners and preventing existing products from being produced again, spending unnecessary resources.
          <br />
          <br />
          Together with the Needyt team, we determined the company's values ​​that should be projected in its image. From several conversations, we generated several sketches that we evaluated in different colors, sizes and formats. Once the logo is chosen, we design several images to present the project and publicize the project's value proposition on different platforms.        </Typography>
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
                  }}
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