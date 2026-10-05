import React from "react";

/** The inner rooms' wall: plain and light, unlike the studio colours of the landing. */
export const WALL = "#efeef0";
/** The pages on this light wall, rather than the studio colours of the landing. */
export const isLightRoom = (pathname: string) =>
  pathname === "/about" || pathname === "/artwork" || pathname === "/projects" || pathname.startsWith("/projects/");

/** A paler surface on the wall: mounts, bands, panels. */
export const MOUNT = "#f8f8f9";

/** Covers the whole screen behind a page's content. */
export const LightWall: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: WALL }} />
);

/**
 * The small type of the inner rooms: mono, lowercase, one even letter spacing.
 * Regular weight, not light: at this size a hairline stroke fades on the pale wall.
 */
export const SMALL = "font-mono text-[11px] font-normal lowercase tracking-[0.04em]";
