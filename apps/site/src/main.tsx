import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
// Controle de debordement horizontal (developpement uniquement) : /fr?overflow -> le titre de l'onglet indique le resultat.
if (import.meta.env.DEV && location.search.includes('overflow')) {
  setTimeout(() => {
    const el = document.documentElement;
    const wide = [...document.querySelectorAll<HTMLElement>('body *')].filter((n) => n.getBoundingClientRect().right > el.clientWidth + 1).slice(0, 5).map((n) => `${n.tagName}.${String(n.className).slice(0, 40)}`);
    document.title = `overflow:${el.scrollWidth > el.clientWidth}|w=${el.clientWidth}|${wide.join(';')}`; // overflow-check
  }, 3500);
}