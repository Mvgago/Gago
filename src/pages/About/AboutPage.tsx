import React from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material'; // Icono para el botón

export const AboutPage: React.FC = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        padding: '40px 20px',
        marginBottom: { xs: 0, sm: 5 }, // Margin bottom 0 en dispositivos móviles
        marginTop: { xs: 0, sm: 10 },    // Margin top 0 en dispositivos móviles
      }}
    >
      <Grid container spacing={4}>
        {/* Sección de información */}
        <Grid item xs={12} md={6}>
          <Box sx={{ padding: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Hello, I'm Manu
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              digital designer passionate about working on projects that inspire people.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              I create digital experiences that evoke emotions and foster connections. With five years of experience, I design everything from marketing assets to responsive web applications, guiding each project from ideation to deployment. I also collaborate with artists to bring their visions to life, crafting visual environments that enhance their identity and connect with audiences.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              If you made it this far, we're meant to work together. You can see my experience and my education on my CV:
            </Typography>
            <Button
              variant="contained"
              href="/cv.pdf" // Asegúrate de que la ruta sea correcta
              download
              sx={{
                marginTop: '15px',
                backgroundColor: '#D4CDC3',
                color: 'white',
                borderRadius: '25px',
                padding: '12px 24px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#A09586',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              See my CV
            </Button>
          </Box>
        </Grid>

        {/* Sección de contacto */}
        <Grid item xs={12} md={6}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            mt={4}
            sx={{ backgroundColor: '#f9f9f9', borderRadius: 2, padding: 3 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              Contact Me
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'grey.400', // Color del borde normal
                      },
                      '&:hover fieldset': {
                        borderColor: '#D4CDC3', // Color marrón en hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D4CDC3', // Color marrón al estar en foco
                      },
                      '&.Mui-focused': {
                        '& input': {
                          color: 'black', // Cambia el color del texto en foco si es necesario
                        },
                      },
                    },
                    marginBottom: 2, // Espaciado inferior
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  required
                  type="email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'grey.400',
                      },
                      '&:hover fieldset': {
                        borderColor: '#D4CDC3', // Color marrón en hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D4CDC3', // Color marrón al estar en foco
                      },
                      '&.Mui-focused': {
                        '& input': {
                          color: 'black', // Cambia el color del texto en foco si es necesario
                        },
                      },
                    },
                    marginBottom: 2, // Espaciado inferior
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  required
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'grey.400',
                      },
                      '&:hover fieldset': {
                        borderColor: '#D4CDC3', // Color marrón en hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#D4CDC3', // Color marrón al estar en foco
                      },
                      '&.Mui-focused': {
                        '& input': {
                          color: 'black', // Cambia el color del texto en foco si es necesario
                        },
                      },
                    },
                    marginBottom: 2, // Espaciado inferior
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#D4CDC3',
                    color: 'white',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#A09586',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  type="submit"
                  startIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};