import React from "react";
import { Box, Typography } from "@mui/material";
import Carousel from "react-bootstrap/Carousel";
import 'bootstrap/dist/css/bootstrap.min.css';

// Importa las imágenes para el carrusel
import portada from "../../assets/img/portada.png";
import portada2 from "../../assets/img/portada2.png";
import portada3 from "../../assets/img/portada3.png";
import portada4 from "../../assets/img/portada4.jpg";
import portada5 from "../../assets/img/portada5.png";

// Home Component
export const Home: React.FC = () => {
  const images = [portada3, portada4, portada5, portada2, portada];

  return (
    <Box sx={{ position: "relative", width: "100%", height: "90vh", overflow: "hidden", userSelect: "none" }}>
      <Carousel interval={5000} controls={false}>
        {images.map((image, index) => (
          <Carousel.Item key={index}>
            <Box
              sx={{
                height: "100vh",
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                userSelect: "none",
                pointerEvents: "none", // Deshabilita interacciones en el fondo
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Texto fijo sobre el carrusel */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "white",
          zIndex: 3, // Coloca el texto sobre la capa y el carrusel
        }}
      >
        <Typography variant="h2" sx={{ fontFamily: 'Syne, sans-serif', fontWeight: 400 }}>
          Digital Designer
        </Typography>

        <Typography sx={{ fontFamily: 'Montserrat, sans-serif' }}>
          UI/UX 3D Designer, architect of atmospheres and visual concepts
        </Typography>
      </Box>
    </Box>
  );
};