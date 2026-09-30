import React from "react";
import { useI18n } from "../../i18n/I18n";

/** Status dot and label; both take the surrounding text colour. */
export const StudioStatus: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { t } = useI18n();
  return (
    <div className={`meta flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40 [animation-duration:2.8s]" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      <span>{t("status")}</span>
    </div>
  );
};
