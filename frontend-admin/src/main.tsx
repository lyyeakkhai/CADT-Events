import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables');
}

/** Vite base ends with `/` (e.g. `/` or `/admin/`). Router basename has no trailing slash. */
const viteBase = import.meta.env.BASE_URL || '/';
const routerBasename = viteBase === '/' ? undefined : viteBase.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      // Stay under admin base after sign-out (e.g. /admin/)
      afterSignOutUrl={viteBase}
    >
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
);
