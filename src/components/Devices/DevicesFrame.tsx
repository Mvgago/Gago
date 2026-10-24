import React, { useEffect, useRef, useState } from "react";

/**
 * An interactive 3D piece served as its own page (public/concepts/…), framed inside the case.
 * It loads only as it nears the screen, and is told to pause whenever it scrolls out of view,
 * so a heavy scene never runs in the background.
 */
const DevicesFrame: React.FC<{ src: string; title: string; className?: string; paused?: boolean; allowed?: boolean; id?: string }> = ({ src, title, className = "", paused = false, allowed = true, id }) => {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(false);
  // built only once it is both near the screen and allowed (a page may hold it back while it loads other things)
  const load = near && allowed;
  const inView = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // held still while another example shares its frame, so it never competes with the one on view
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ fhVisible: inView.current && !paused }, window.location.origin);
  }, [paused]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        inView.current = entry.isIntersecting;
        frame.current?.contentWindow?.postMessage({ fhVisible: entry.isIntersecting && !pausedRef.current }, window.location.origin);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    // phones and tablets: let go of it again once it is more than a screen away, so a page with several
    // scenes never holds them all at once (a phone runs out of memory and reloads the page)
    const far = window.matchMedia("(max-width: 1023px)").matches
      ? new IntersectionObserver(([entry]) => !entry.isIntersecting && setNear(false), { rootMargin: "100% 0px" })
      : null;
    far?.observe(el);
    return () => {
      io.disconnect();
      far?.disconnect();
    };
  }, []);

  return (
    <div ref={box} id={id} className={`relative overflow-hidden bg-[#d5dcdf] ${className}`}>
      {load && (
        <iframe
          ref={frame}
          src={src}
          title={title}
          // once its page is up, it is told at once whether it is on view (the earlier word came before it existed)
          onLoad={() => frame.current?.contentWindow?.postMessage({ fhVisible: inView.current && !pausedRef.current }, window.location.origin)}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
};

export default DevicesFrame;
