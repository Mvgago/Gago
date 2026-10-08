import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { PointerLightProvider } from "./components/Light/PointerLight";
import { I18nProvider } from "./i18n/I18n";
import { StudioAtmosphere } from "./components/Light/StudioAtmosphere";
import { DARK_WALL, WALL, isLightRoom } from "./components/Light/LightWall";
import { SiteHeader } from "./components/Header/SiteHeader";
import { PageTransition } from "./components/PageTransition/PageTransition";
import Footer from "./components/Footer/Footer";
import { BackToTop } from "./components/BackToTop/BackToTop";
import { SmoothScroll, scrollToTarget, useLenis } from "./components/SmoothScroll/SmoothScroll";

import { Home } from "./pages/Home/Home";
import { ProjectsSection } from "./pages/Projects/ProjectsSection";
import { AboutPage } from "./pages/About/AboutPage";
import { ArtworkPage } from "./pages/Artwork/ArtworkPage";
import { NeedytPage } from "./pages/Needyt/Needyt";
import { AmvreportPage } from "./pages/Amvreport/Amvreport";
import { AnnetPage } from "./pages/Annet/Annet";
import { AmorsacroPage } from "./pages/Amorsacro/Amorsacro";
import { CaseStudyPage } from "./pages/Projects/CaseStudy";
import { PrivacyPage } from "./pages/Privacy/PrivacyPage";

const page = (element: React.ReactNode, withFooter = true, still = false) => (
  <PageTransition still={still} className="relative z-10 flex min-h-screen flex-col">
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
  // The projects page is the one dark room: its own graphite comes in instead of the light wall.
  const wall = location.pathname === "/projects" ? DARK_WALL : isLightRoom(location.pathname) ? WALL : null;

  return (
    <I18nProvider>
    {/* Smooth, inertial scroll for the whole site */}
    <SmoothScroll>
    <PointerLightProvider>
      <StudioAtmosphere />
      <AnimatePresence initial={false}>
        {wall && (
          <motion.div
            key={wall}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            style={{ background: wall }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.45 } }}
            exit={{ opacity: 0, transition: { duration: 0.45, delay: 0.3 } }}
          />
        )}
      </AnimatePresence>
      <SiteHeader />
      <BackToTop />

      <Pages location={location} />
    </PointerLightProvider>
    </SmoothScroll>
    </I18nProvider>
  );
};

/** The routed pages. Each new page starts at the top, set instantly (no glide) once the old one has left. */
const Pages: React.FC<{ location: ReturnType<typeof useLocation> }> = ({ location }) => {
  const lenis = useLenis();
  // While the old page fades out, the view glides back to the top with the smooth scroll,
  // so leaving a page part-way down never jumps
  useEffect(() => {
    if (lenis && window.scrollY > 0) lenis.scrollTo(0, { duration: 0.45 });
  }, [location.pathname, lenis]);
  return (
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => scrollToTarget(lenis, 0, { immediate: true })}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={page(<Home />, false)} />
          {/* Info closes in its own dark room, with the footer inside it */}
          <Route path="/about" element={page(<AboutPage />, false)} />
          <Route path="/artwork" element={page(<ArtworkPage />)} />
          {/* Trial: the new technical index. The previous one is ProjectsPage in pages/Projects/Projects.tsx */}
          {/* Exactly one screen: no footer under it (it made the page scroll, and the scrollbar
              narrowed the film), and a fade only, so the frame never moves on arrival */}
          <Route path="/projects" element={page(<ProjectsSection />, false, true)} />
          <Route path="/privacy" element={page(<PrivacyPage />)} />
          {/* The selected cases now live under /projects/<slug> */}
          <Route path="/sapphire" element={<Navigate to="/projects/sapphire" replace />} />
          <Route path="/smarthc" element={<Navigate to="/projects/smarthc" replace />} />
          <Route path="/buendia" element={<Navigate to="/projects/buendia" replace />} />
          <Route path="/needyt" element={caseStudy(<NeedytPage />)} />
          <Route path="/santa" element={<Navigate to="/projects" replace />} />
          <Route path="/alea" element={<Navigate to="/projects" replace />} />
          <Route path="/amvreport" element={caseStudy(<AmvreportPage />)} />
          <Route path="/annet" element={caseStudy(<AnnetPage />)} />
          <Route path="/amorsacro" element={caseStudy(<AmorsacroPage />)} />
          <Route path="/projects/:slug" element={page(<CaseStudyPage />)} />
        </Routes>
      </AnimatePresence>
  );
};
