import React, { Suspense, lazy, useEffect } from "react";
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
import { usePageMeta } from "./hooks/usePageMeta";

// The landing comes in the first download; every other page is fetched when it is visited (all of
// them in the first download kept a phone busy for seconds before the landing could be used)
const ProjectsSection = lazy(() => import("./pages/Projects/ProjectsSection").then((m) => ({ default: m.ProjectsSection })));
const AboutPage = lazy(() => import("./pages/About/AboutPage").then((m) => ({ default: m.AboutPage })));
const ArtworkPage = lazy(() => import("./pages/Artwork/ArtworkPage").then((m) => ({ default: m.ArtworkPage })));
const CaseStudyPage = lazy(() => import("./pages/Projects/CaseStudy").then((m) => ({ default: m.CaseStudyPage })));
const PrivacyPage = lazy(() => import("./pages/Privacy/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const LegalPage = lazy(() => import("./pages/Privacy/LegalPage").then((m) => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

const page = (element: React.ReactNode, withFooter = true, still = false) => (
  // (the screen's real height on phones, not the taller one under the browser's bars: a short page never
  // scrolls away from its footer)
  <PageTransition still={still} className="relative z-10 flex min-h-[100dvh] flex-col">
    <Suspense fallback={null}>
      {element}
      {withFooter && <Footer />}
    </Suspense>
  </PageTransition>
);

// Case-study pages predate the fixed header; give them clearance beneath it.

// Inside the language provider, so the titles follow the chosen language
const PageMeta: React.FC<{ pathname: string }> = ({ pathname }) => {
  usePageMeta(pathname);
  return null;
};

export const App: React.FC = () => {
  const location = useLocation();
  // The light rooms' wall changes as soon as the route does, under the page
  // transition, so the landing's colours never show through while a page fades in.
  // The projects page is the one dark room: its own graphite comes in instead of the light wall.
  const wall = location.pathname === "/projects" ? DARK_WALL : isLightRoom(location.pathname) ? WALL : null;

  return (
    <I18nProvider>
    <PageMeta pathname={location.pathname} />
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
          <Route path="/artwork" element={page(<ArtworkPage />, false)} />
          {/* Trial: the new technical index. The previous one is ProjectsPage in pages/Projects/Projects.tsx */}
          {/* Exactly one screen: no footer under it (it made the page scroll, and the scrollbar
              narrowed the film), and a fade only, so the frame never moves on arrival */}
          <Route path="/projects" element={page(<ProjectsSection />, false, true)} />
          <Route path="/privacy" element={page(<PrivacyPage />)} />
          <Route path="/legal" element={page(<LegalPage />)} />
          {/* The selected cases now live under /projects/<slug> */}
          <Route path="/sapphire" element={<Navigate to="/projects/sapphire" replace />} />
          <Route path="/smarthc" element={<Navigate to="/projects/smarthc" replace />} />
          <Route path="/buendia" element={<Navigate to="/projects/buendia" replace />} />
          <Route path="/needyt" element={<Navigate to="/projects" replace />} />
          <Route path="/santa" element={<Navigate to="/projects" replace />} />
          <Route path="/alea" element={<Navigate to="/projects" replace />} />
          <Route path="/amvreport" element={<Navigate to="/projects" replace />} />
          <Route path="/annet" element={<Navigate to="/projects" replace />} />
          <Route path="/amorsacro" element={<Navigate to="/projects" replace />} />
          <Route path="/projects/:slug" element={page(<CaseStudyPage />)} />
          {/* anything else: a page that says so, with the ways back */}
          <Route path="*" element={page(<NotFoundPage />)} />
        </Routes>
      </AnimatePresence>
  );
};
