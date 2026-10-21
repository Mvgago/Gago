import React, { useEffect, useRef, useState } from "react";

/**
 * Printed cards laid out in slanted rows on a coloured table, the rows sliding on forever,
 * up and to the right. Built from the cards themselves (two designs, alternating), so the
 * loop has no seam and the cards never leave the frame. Moves only while on screen; still
 * for those who ask for less motion.
 */

// Proportions taken from the photograph it replaces (smart (2)), in % of the frame's width
const CARD_W = 37; // a card's width
const CARD_H = CARD_W * (497 / 878);
const GAP = 2.4; // between cards in a row
const ROW_GAP = 4.6; // between rows
const ROW_SHIFT = 17.7; // each row starts this far along from the one above
const PITCH = CARD_W + GAP;
const ROWS = 9;
const PER_ROW = 12; // even, so the two designs alternate across the seam

export const CardsConveyor: React.FC<{
  cards: [string, string];
  backdrop?: string;
  alt?: string;
  className?: string;
  /** seconds for one card to pass its own width */
  pace?: number;
}> = ({ cards, backdrop = "#8fa7af", alt = "", className = "", pace = 5 }) => {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = box.current;
    if (!el || still) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  const unit = (n: number) => `${n}cqw`;
  return (
    <div
      ref={box}
      role="img"
      aria-label={alt}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ background: backdrop, containerType: "inline-size" }}
    >
      {/* one period is two cards (the two designs), so moving by two pitches lands on the same picture */}
      <style>{`@keyframes cards-slide { from { transform: translateX(${unit(-2 * PITCH)}); } to { transform: translateX(0); } }`}</style>
      <div
        className="absolute left-1/2 top-1/2 flex flex-col"
        style={{ gap: unit(ROW_GAP), transform: "translate(-50%, -50%) rotate(-30deg)" }}
      >
        {Array.from({ length: ROWS }, (_, r) => (
          <div
            key={r}
            className="flex"
            style={{
              gap: unit(GAP),
              // each row set along from the one above, kept within one period so all rows look alike
              marginLeft: unit(-((r * ROW_SHIFT) % (2 * PITCH)) - 2 * PITCH),
              animation: still ? undefined : `cards-slide ${pace * 2}s linear infinite`,
              animationPlayState: on ? "running" : "paused",
            }}
          >
            {Array.from({ length: PER_ROW }, (_, i) => (
              <img
                key={i}
                src={cards[(i + r) % 2]}
                alt=""
                draggable={false}
                className="block shrink-0"
                style={{
                  width: unit(CARD_W),
                  height: unit(CARD_H),
                  boxShadow: `0 ${unit(0.8)} ${unit(2.2)} rgba(28, 40, 46, 0.32)`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardsConveyor;
