import React from "react";
import { AppRoutes } from "./AppRoutes";

export const App: React.FC = () => {
  return <AppRoutes />;
};

// import React from "react";
// import { BrowserRouter as Router } from "react-router-dom"; // Importa BrowserRouter
// import { AppRoutes } from "./AppRoutes";

// export const App: React.FC = () => {
//   return (
//     <Router> {/* Envuelve tus rutas en BrowserRouter */}
//       <AppRoutes />
//     </Router>
//   );
// };
