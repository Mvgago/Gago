import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { PointerLightProvider } from "./components/Light/PointerLight";
import { I18nProvider } from "./i18n/I18n";
import { StudioAtmosphere } from "./components/Light/StudioAtmosphere";
import { SiteHeader } from "./components/Header/SiteHeader";
import { PageTransition } from "./components/PageTransition/PageTransition";
import Footer from "./components/Footer/Footer";

import { Home } from "./pages/Home/Home";
import { ProjectsPage } from "./pages/Projects/Projects";
import { AboutPage } from "./pages/About/AboutPage";
import { ArtworkPage } from "./pages/Artwork/ArtworkPage";
import { SapphirePage } from "./pages/Sapphire/Sapphire";
import { SmartPage } from "./pages/Smart/Smart";
import { BuendiaPage } from "./pages/Buendia/Buendia";
import { NeedytPage } from "./pages/Needyt/Needyt";
import { SantaPage } from "./pages/Santa/Santa";
import { AleaPage } from "./pages/Alea/Alea";
import { AmvreportPage } from "./pages/Amvreport/Amvreport";
import { AnnetPage } from "./pages/Annet/Annet";
import { AmorsacroPage } from "./pages/Amorsacro/Amorsacro";
import ProjectDetailPage from "./pages/ProjectDetails/ProjectDetails";

const page = (element: React.ReactNode, withFooter = true) => (
  <PageTransition className="relative z-10 flex min-h-screen flex-col">
    {element}
    {withFooter && <Footer />}
  </PageTransition>
);

// Case-study pages predate the fixed header; give them clearance beneath it.
const caseStudy = (element: React.ReactNode) => page(<div className="pt-16 sm:pt-20">{element}</div>);

export const App: React.FC = () => {
  const location = useLocation();

  return (
    <I18nProvider>
    <PointerLightProvider>
      <StudioAtmosphere />
      <SiteHeader />

      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={page(<Home />, false)} />
          <Route path="/about" element={page(<AboutPage />)} />
          <Route path="/artwork" element={page(<ArtworkPage />)} />
          <Route path="/projects" element={page(<ProjectsPage />)} />
          <Route path="/sapphire" element={caseStudy(<SapphirePage />)} />
          <Route path="/smarthc" element={caseStudy(<SmartPage />)} />
          <Route path="/buendia" element={caseStudy(<BuendiaPage />)} />
          <Route path="/needyt" element={caseStudy(<NeedytPage />)} />
          <Route path="/santa" element={caseStudy(<SantaPage />)} />
          <Route path="/alea" element={caseStudy(<AleaPage />)} />
          <Route path="/amvreport" element={caseStudy(<AmvreportPage />)} />
          <Route path="/annet" element={caseStudy(<AnnetPage />)} />
          <Route path="/amorsacro" element={caseStudy(<AmorsacroPage />)} />
          <Route path="/projects/:projectId" element={caseStudy(<ProjectDetailPage />)} />
        </Routes>
      </AnimatePresence>
    </PointerLightProvider>
    </I18nProvider>
  );
};
