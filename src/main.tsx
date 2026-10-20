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
new MutationObserver(() => {
  document.querySelectorAll('video:not([data-locked])').forEach((v) => {
    v.setAttribute('controlslist', 'nodownload noremoteplayback');
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('data-locked', '');
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
