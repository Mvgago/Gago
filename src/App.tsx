import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { PointerLightProvider } from "./components/Light/PointerLight";
import { I18nProvider } from "./i18n/I18n";
import { StudioAtmosphere } from "./components/Light/StudioAtmosphere";
import { WALL, isLightRoom } from "./components/Light/LightWall";
import { SiteHeader } from "./components/Header/SiteHeader";
import { PageTransition } from "./components/PageTransition/PageTransition";
import Footer from "./components/Footer/Footer";
import { BackToTop } from "./components/BackToTop/BackToTop";

import { Home } from "./pages/Home/Home";
import { ProjectsPage } from "./pages/Projects/Projects";
import { AboutPage } from "./pages/About/AboutPage";
import { ArtworkPage } from "./pages/Artwork/ArtworkPage";
import { NeedytPage } from "./pages/Needyt/Needyt";
import { AmvreportPage } from "./pages/Amvreport/Amvreport";
import { AnnetPage } from "./pages/Annet/Annet";
import { AmorsacroPage } from "./pages/Amorsacro/Amorsacro";
import { CaseStudyPage } from "./pages/Projects/CaseStudy";
import { PrivacyPage } from "./pages/Privacy/PrivacyPage";

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
  // The light rooms' wall changes as soon as the route does, under the page
  // transition, so the landing's colours never show through while a page fades in.
  const lightRoom = isLightRoom(location.pathname);

  return (
    <I18nProvider>
    <PointerLightProvider>
      <StudioAtmosphere />
      <AnimatePresence initial={false}>
        {lightRoom && (
          <motion.div
            key="light-wall"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            style={{ background: WALL }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.45 } }}
            exit={{ opacity: 0, transition: { duration: 0.45, delay: 0.3 } }}
          />
        )}
      </AnimatePresence>
      <SiteHeader />
      <BackToTop />

      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={page(<Home />, false)} />
          {/* Info closes in its own dark room, with the footer inside it */}
          <Route path="/about" element={page(<AboutPage />, false)} />
          <Route path="/artwork" element={page(<ArtworkPage />)} />
          <Route path="/projects" element={page(<ProjectsPage />)} />
          <Route path="/privacy" element={page(<PrivacyPage />)} />
          {/* The selected cases now live under /projects/<slug> */}
          <Route path="/sapphire" element={<Navigate to="/projects/sapphire" replace />} />
          <Route path="/smarthc" element={<Navigate to="/projects/smarthc" replace />} />
          <Route path="/buendia" element={<Navigate to="/projects/buendia" replace />} />
          <Route path="/needyt" element={caseStudy(<NeedytPage />)} />
          <Route path="/santa" element={<Navigate to="/projects/santa-engracia" replace />} />
          <Route path="/alea" element={<Navigate to="/projects/alea" replace />} />
          <Route path="/amvreport" element={caseStudy(<AmvreportPage />)} />
          <Route path="/annet" element={caseStudy(<AnnetPage />)} />
          <Route path="/amorsacro" element={caseStudy(<AmorsacroPage />)} />
          <Route path="/projects/:slug" element={page(<CaseStudyPage />)} />
        </Routes>
      </AnimatePresence>
    </PointerLightProvider>
    </I18nProvider>
  );
};
