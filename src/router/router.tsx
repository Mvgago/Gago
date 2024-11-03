import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppRoutes } from "../AppRoutes";

// Definir el enrutador
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoutes />, // Esto renderiza tu AppRoutes
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* Proveedor del enrutador */}
  </React.StrictMode>
);