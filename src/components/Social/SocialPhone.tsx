import React from "react";

/**
 * A phone showing a brand's social profile: the avatar and name, a line of bio, and a
 * grid of posts that drifts slowly upwards on its own (and stops under the pointer).
 * A plain, generic profile: no platform's interface is imitated.
 */

type Props = {
  /** The posts, as square tiles (any image is cropped to a square) */
  tiles: string[];
  name: string;
  bio: string;
  avatar: React.ReactNode;
  /** Band colour around the phone */
  background?: string;
  className?: string;
};

const SocialPhone: React.FC<Props> = ({ tiles, name, bio, avatar, background = "#a9b8ba", className = "" }) => {
  // The grid twice over, so the drift loops without a seam
  const loop = [...tiles, ...tiles];
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ background }}>
      <style>{`
        @keyframes social-drift { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        .social-feed { animation: social-drift ${tiles.length * 3.2}s linear infinite; }
        .social-phone:hover .social-feed { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .social-feed { animation: none; } }
      `}</style>

      {/* The phone: dark rounded body, a thin bezel, a small camera notch */}
      <div
        className="social-phone relative aspect-[9/19] h-[86%] max-h-[640px] rounded-[2.4rem] bg-[#16181a] p-[0.55rem] shadow-[0_40px_80px_-30px_rgba(20,26,30,0.55)]"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.9rem] bg-white">
          <div aria-hidden className="absolute left-1/2 top-2 z-20 h-[0.9rem] w-[28%] -translate-x-1/2 rounded-full bg-[#16181a]" />

          {/* Profile header, still */}
          <div className="relative z-10 flex flex-col gap-2 bg-white px-4 pb-3 pt-9">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full">{avatar}</div>
              <div className="min-w-0">
                <p className="truncate font-geo text-[13px] font-normal text-[#2b2f33]">{name}</p>
                <p className="truncate font-geo text-[11px] text-[#6b7378]">{bio}</p>
              </div>
            </div>
            <div className="h-px w-full bg-[#e6e9eb]" />
          </div>

          {/* The posts, drifting */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="social-feed grid grid-cols-3 gap-[2px]">
              {loop.map((src, i) => (
                <img key={i} src={src} alt="" loading="lazy" draggable={false} className="aspect-square w-full object-cover" />
              ))}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/80 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPhone;
