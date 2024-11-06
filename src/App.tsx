import React from 'react';
import { ProjectsPage } from "./pages/Projects/Projects";
import Footer from "./components/Footer/Footer";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AboutPage } from './pages/About/AboutPage';
import { ArtworkPage } from './pages/Artwork/ArtworkPage';
import { SapphirePage } from './pages/Sapphire/Sapphire';
import { SmartPage } from './pages/Smart/Smart';
import { BuendiaPage } from './pages/Buendia/Buendia';
import { NeedytPage } from './pages/Needyt/Needyt';
import { SantaPage } from './pages/Santa/Santa';
import { AleaPage } from './pages/Alea/Alea';
import { AmvreportPage } from './pages/Amvreport/Amvreport';
import { AnnetPage } from './pages/Annet/Annet';
import { AmorsacroPage } from './pages/Amorsacro/Amorsacro';
import ProjectDetailPage from './pages/ProjectDetails/ProjectDetails';
import { NavBar } from './components/NavBar/NavBar';
import { Home } from './pages/Home/Home';
// Otras páginas importadas

export const App: React.FC = () => {
  return (
    <div>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/artwork" element={<ArtworkPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/sapphire" element={<SapphirePage />} />
          <Route path="/smarthc" element={<SmartPage />} />
          <Route path="/buendia" element={<BuendiaPage />} />
          <Route path="/needyt" element={<NeedytPage />} />
          <Route path="/santa" element={<SantaPage />} />
          <Route path="/alea" element={<AleaPage />} />
          <Route path="/amvreport" element={<AmvreportPage />} />
          <Route path="/annet" element={<AnnetPage />} />
          <Route path="/amorsacro" element={<AmorsacroPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};