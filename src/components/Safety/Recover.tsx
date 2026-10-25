import React from "react";

/**
 * If anything on a page fails to draw, the site would leave only its bare mauve ground. Most often it
 * is a piece of an older version the browser asks for after a new one went live: then the page is
 * simply loaded again, once. Anything else shows a quiet way back instead of an empty screen.
 */
const KEY = "fh-recovered";

export const reloadOnce = () => {
  try {
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* no storage: reload anyway */
  }
  window.location.reload();
  return true;
};

export class Recover extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    const msg = String((error as Error)?.message ?? error);
    // a piece of the site that no longer exists (a new version went live): load the page again
    if (/dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(msg)) reloadOnce();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-6 text-center text-ink">
        <p className="font-[var(--font-mono)] text-sm">
          Algo no ha cargado bien.{" "}
          <a href={window.location.pathname} className="underline underline-offset-4">
            Volver a cargar
          </a>
        </p>
      </main>
    );
  }
}
