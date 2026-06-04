import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-navy-dark px-4 overflow-hidden grid-bg text-white">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />

      {/* 404 Panel */}
      <div className="relative z-10 max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary glow-pulse">
          <HelpCircle className="h-10 w-10 animate-bounce" />
        </div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold to-orange-500 tracking-wider">
          404
        </h1>
        <h2 className="text-2xl font-bold tracking-tight text-white mt-4 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          The prediction coordinate you are looking for does not exist or has been shifted in the cost grid.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-primary/20 glow-button transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Orbit
        </Link>
      </div>
    </div>
  );
};
export default NotFoundPage;
