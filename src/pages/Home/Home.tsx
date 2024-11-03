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
  return (
    <Box sx={{ position: "relative", width: "100%", height: "90vh", overflow: "hidden" }}>
      <Carousel interval={5000} controls={false}>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={portada3}
            alt="First slide"
            style={{ height: "100vh", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={portada4}
            alt="Second slide"
            style={{ height: "100vh", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={portada5}
            alt="Second slide"
            style={{ height: "100vh", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={portada2}
            alt="Second slide"
            style={{ height: "100vh", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={portada}
            alt="Second slide"
            style={{ height: "100vh", objectFit: "cover" }}
          />
        </Carousel.Item>
      </Carousel>

      {/* Texto fijo sobre el carrusel */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)", // Centrar el texto
          textAlign: "center",
          color: "white",
          zIndex: 1, // Asegúrate de que el texto esté sobre el carrusel
        }}
      >
        <Typography variant="h2" sx={{ fontFamily: 'Syne, sans-serif', fontWeight: 400 }}>
          Digital Designer
        </Typography>

        <Typography sx={{ fontFamily: 'SMontserrat, sans-serif'}}>
            UI/UX 3D Designer, architect of atmospheres and visual concepts
        </Typography>
        {/* <Typography variant="subtitle1">
            UI/UX 3D Designer, architect of atmospheres and visual concepts
        </Typography> */}
      </Box>
    </Box>
  );
};