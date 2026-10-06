import React from "react";

/** The inner rooms' wall: plain and light, unlike the studio colours of the landing. */
export const WALL = "#efeef0";
/** The pages on this light wall, rather than the studio colours of the landing. */
export const isLightRoom = (pathname: string) =>
  pathname === "/about" || pathname === "/artwork" || pathname === "/projects" || pathname.startsWith("/projects/");

/** The one dark room's wall (projects, and the contact block on info): warm graphite. */
export const DARK_WALL = "#2f2b2a";

/** A paler surface on the wall: mounts, bands, panels. */
export const MOUNT = "#f8f8f9";

/** Covers the whole screen behind a page's content. */
export const LightWall: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: WALL }} />
);

/** The small type, now part of the site's type scale */
export { SMALL } from "../../lib/type";
