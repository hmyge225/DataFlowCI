import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  panelSide: 'left' | 'right';
  panelTitle: string;
  panelText: string;
  panelButtonText: string;
  panelButtonTo: string;
  formTitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  panelSide,
  panelTitle,
  panelText,
  panelButtonText,
  panelButtonTo,
  formTitle,
  children,
}: AuthLayoutProps) {
  const panel = (
    <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-brand-dark to-brand px-10 py-12 text-center text-white md:w-1/2">
      <div className="absolute -top-10 -right-10 h-32 w-32 rotate-45 rounded-2xl bg-highlight/20" />
      <div className="absolute bottom-10 left-6 h-16 w-16 rotate-45 rounded-lg bg-accent/30" />

      <h2 className="text-3xl font-bold">{panelTitle}</h2>
      <p className="max-w-xs text-sm text-white/90">{panelText}</p>
      <Link
        to={panelButtonTo}
        className="rounded-full border border-white px-8 py-2.5 text-sm font-semibold uppercase tracking-wide transition hover:bg-white hover:text-brand"
      >
        {panelButtonText}
      </Link>
    </div>
  );

  const form = (
    <div className="flex w-full flex-col items-center justify-center gap-6 bg-white px-8 py-12 md:w-1/2">
      <h1 className="text-3xl font-bold text-brand">{formTitle}</h1>
      {children}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="flex min-h-150 w-full max-w-6xl flex-col overflow-hidden rounded-2xl shadow-2xl md:flex-row">
        {panelSide === 'left' ? (
          <>
            {panel}
            {form}
          </>
        ) : (
          <>
            {form}
            {panel}
          </>
        )}
      </div>
    </div>
  );
}
