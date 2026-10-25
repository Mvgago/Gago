import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from './App';

// No image, film or 3D scene on the site can be saved or copied from the browser: no context menu
// (save image as, copy image), no dragging out, and videos offer no download
const isMedia = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest('img, video, canvas, picture, svg, [data-protect]');
// no context menu anywhere on the page (it offers "save as" from any spot), except in the form's fields
document.addEventListener('contextmenu', (e) => {
  if (!(e.target instanceof Element && e.target.closest('input, textarea'))) e.preventDefault();
});
// nor the shortcuts that save, print or show the source of the page
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p' || k === 'u')) e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  if (isMedia(e.target)) e.preventDefault();
});
// Every film on the site plays on its own, silent, on phones too. React sets `muted` only as a
// property, never as the attribute, and iOS Safari wants the attribute before it will start a film
// unasked: so it is written here, with playsinline, and each film is asked to play once it nears
// the screen. Where the phone still holds it back (low-power mode), the first touch anywhere on
// the page starts them all
const start = (v: HTMLVideoElement) => {
  if (!v.autoplay || !v.paused) return;
  v.muted = true;
  void v.play().catch(() => {});
};
const inView = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && start(e.target as HTMLVideoElement)),
  { rootMargin: '25% 0px' },
);
const wake = () => document.querySelectorAll('video').forEach((v) => start(v));
// (touchend and click too: in-app browsers such as WhatsApp's only take those as leave to play)
['touchstart', 'touchend', 'pointerdown', 'click', 'scroll'].forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
new MutationObserver(() => {
  document.querySelectorAll<HTMLVideoElement>('video:not([data-locked])').forEach((v) => {
    v.setAttribute('controlslist', 'nodownload noremoteplayback');
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('data-locked', '');
    inView.observe(v);
    start(v);
  });
}).observe(document.documentElement, { childList: true, subtree: true });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
