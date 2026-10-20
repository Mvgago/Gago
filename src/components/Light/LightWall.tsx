import React from "react";

/** The inner rooms' wall: plain and light, unlike the studio colours of the landing. */
export const WALL = "#efeef0";
/** The pages on this light wall, rather than the studio colours of the landing. */
export const isLightRoom = (pathname: string) =>
  pathname === "/about" || pathname === "/projects" || pathname.startsWith("/projects/");

/** The one dark room's wall (projects, and the contact block on info): warm graphite. */
export const DARK_WALL = "#2f2b2a";

/** A paler surface on the wall: mounts, bands, panels. */
export const MOUNT = "#f8f8f9";

/** Covers the whole screen behind a page's content. */
export const LightWall: React.FC = () => {
  // the same wall under the page itself, so a phone's overscroll shows it, not the landing's colour
  React.useEffect(() => {
    document.documentElement.style.background = WALL;
    document.body.style.background = WALL;
    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
    };
  }, []);
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: WALL }} />;
};

/** The small type, now part of the site's type scale */
export { SMALL } from "../../lib/type";
