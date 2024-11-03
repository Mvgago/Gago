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

import portada from "../../assets/peojects/amvreport/report3.png";
import portada2 from "../../assets/peojects/amvreport/report2.jpeg";
import portada3 from "../../assets/peojects/amvreport/report6.png";
import portada4 from "../../assets/peojects/amvreport/report4.jpg";
import portada5 from "../../assets/peojects/amvreport/report5.jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';




const images = [
    // { src: portada4, alt: 'Image 1' },
    { src: portada4, alt: 'Image 2' },
    { src: portada3, alt: 'Image 1' },
    { src: portada, alt: 'Image 1' },
    { src: portada2, alt: 'Image 2' },
];

export const AmvreportPage: React.FC = () => {

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
          AMV Report
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
AMV Report Software is a specialized tool designed to provide foundry managers with real-time insights into plant performance across key operational parameters. With this software, managers can monitor production efficiency, identify bottlenecks, and optimize workflows, ensuring a streamlined process and data-driven decision-making to boost productivity and quality.          <br />
          <br />
          Responsible for prototyping and front-end development of AMV Report Software, an intuitive interface was created using Figma for design and React with TypeScript for development.         </Typography>
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