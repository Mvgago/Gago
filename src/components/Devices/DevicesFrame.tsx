import React, { useEffect, useRef, useState } from "react";

/**
 * An interactive 3D piece served as its own page (public/concepts/…), framed inside the case.
 * It loads only as it nears the screen, and is told to pause whenever it scrolls out of view,
 * so a heavy scene never runs in the background.
 */
const DevicesFrame: React.FC<{ src: string; title: string; className?: string }> = ({ src, title, className = "" }) => {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoad(true);
        frame.current?.contentWindow?.postMessage({ fhVisible: entry.isIntersecting }, window.location.origin);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative overflow-hidden bg-[#d5dcdf] ${className}`}>
      {load && <iframe ref={frame} src={src} title={title} className="absolute inset-0 h-full w-full border-0" />}
    </div>
  );
};

export default DevicesFrame;
