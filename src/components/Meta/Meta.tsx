import React from "react";
import { isStudioOpen, useNow } from "./useNow";

/** Status dot and label; both take the surrounding text colour. */
export const StudioStatus: React.FC<{ className?: string }> = ({ className = "" }) => {
  const open = isStudioOpen(useNow());
  return (
    <div className={`meta flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        {open && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40 [animation-duration:2.8s]" />}
        <span className={`relative h-1.5 w-1.5 rounded-full ${open ? "bg-current" : "border border-current opacity-70"}`} />
      </span>
      <span>{open ? "studio open" : "studio at rest"}</span>
    </div>
  );
};
