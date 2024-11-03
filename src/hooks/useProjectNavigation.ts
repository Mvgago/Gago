import { useLocation } from 'react-router-dom';

const projectRoutes = [
  "/sapphire",
  "/buendia",
  "/alea",
  "/needyt",
  "/smarthc",
  "/amorsacro",
  "/amvreport",
  "/annet",
  "/santa",
];

export const useProjectNavigation = () => {
  const location = useLocation();

  // Obtener el índice del proyecto actual
  const currentIndex = projectRoutes.indexOf(location.pathname);

  // Determinar los enlaces del proyecto anterior y siguiente
  const previousProject = projectRoutes[currentIndex - 1] || projectRoutes[projectRoutes.length - 1];
  const nextProject = projectRoutes[currentIndex + 1] || projectRoutes[0];

  return { previousProject, nextProject };
};