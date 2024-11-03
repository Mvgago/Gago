import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Divider,
  Link,
} from '@mui/material';

import portada from "../../assets/peojects/saphire/saphire (1).jpg";
import portada2 from "../../assets/peojects/saphire/saphire (2).jpg";
import portada4 from "../../assets/peojects/saphire/saphire (4).jpg";
import portada6 from "../../assets/peojects/saphire/saphire (6).jpg";
import portada7 from "../../assets/peojects/saphire/saphire (7).jpg";
import portada8 from "../../assets/peojects/saphire/saphire (8).jpg";
import portada9 from "../../assets/peojects/saphire/saphire (9).jpg";
import portada10 from "../../assets/peojects/saphire/saphire (10).jpg";
import { NavigationButtons } from '../../components/NavigationArrows/NavigationArros';
import { useProjectNavigation } from '../../hooks/useProjectNavigation';


const images = [
  { src: portada, alt: 'Image 1' },
  { src: portada2, alt: 'Image 2' },
  { src: portada4, alt: 'Image 4' },
  { src: portada6, alt: 'Image 6' },
  { src: portada8, alt: 'Image 2' },
  { src: portada9, alt: 'Image 4' },
  { src: portada10, alt: 'Image 6' },
];

export const SapphirePage: React.FC = () => {

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
          The Sapphire
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
          THE SAPPHIRE project by Darya Homes is a highly exclusive housing
          development on the beachfront, located on the Costa del Sol (Andalusie
          - Spain), in which 12 high-luxury homes are sold. The project is aimed
          at clients with a high purchasing power with a sophisticated lifestyle,
          in which light, nature, comfort and an avant-garde and refined
          environment go hand in hand.
          <br />
          <br />
          The Sapphire brand identity was crafted alongside its commercial
          strategy through a comprehensive analysis of the project and its
          design. Key concepts like luminosity, brilliance, reflection, and
          exclusivity emerged, guiding the creative process to embody luxury and
          elegance. The result is a refined brand image inspired by the allure of
          a blue sapphire, symbolizing rarity and sophistication.
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
            }}
          >
            <CardMedia
              component="img"
              image={image.src}
              alt={image.alt}
              sx={{
                width: '100%',
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