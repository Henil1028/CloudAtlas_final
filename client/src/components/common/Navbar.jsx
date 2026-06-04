import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy-deep/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-lg shadow-navy-dark/40'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-gold p-[1px] shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-navy-deep">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                CloudAtlas <span className="text-primary">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              {[
                { name: 'Features', id: 'features' },
                { name: 'Solutions', id: 'solutions' },
                { name: 'Technology', id: 'technology' },
                { name: 'Pricing', id: 'pricing' },
                { name: 'About', id: 'about' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.id)}
                  className="text-sm font-medium text-gray-300 hover:text-primary hover:glow-text transition-all duration-300 cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
              
              {user && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-300 hover:text-primary hover:glow-text transition-all duration-300"
                >
                  Dashboard
                </Link>
              )}
              {user && user.role === 'super_admin' && (
                <Link
                  to="/analytics"
                  className="text-sm font-medium text-gray-300 hover:text-primary hover:glow-text transition-all duration-300"
                >
                  Analytics
                </Link>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Hi, <span className="font-semibold text-white">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Logout
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover glow-button"
                >
                  Go to Console
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 glow-button transition-all"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[72px] bg-navy-deep/95 backdrop-blur-2xl border-b border-white/5 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
        }`}
      >
        <div className="space-y-1.5 px-4 py-6">
          {[
            { name: 'Features', id: 'features' },
            { name: 'Solutions', id: 'solutions' },
            { name: 'Technology', id: 'technology' },
            { name: 'Pricing', id: 'pricing' },
            { name: 'About', id: 'about' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.id)}
              className="block w-full text-left rounded-xl px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-primary transition-colors cursor-pointer"
            >
              {item.name}
            </button>
          ))}
          
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          {user && user.role === 'super_admin' && (
            <Link
              to="/analytics"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
            >
              Analytics
            </Link>
          )}

          <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
            {user ? (
              <div className="px-4">
                <p className="text-sm text-gray-400 mb-3">
                  Signed in as <span className="font-semibold text-white">{user.name}</span>
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center rounded-xl bg-primary py-3 text-base font-semibold text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                  >
                    Go to Console
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex justify-center items-center rounded-xl bg-white/5 py-3 text-base font-semibold text-white hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center items-center rounded-xl bg-white/5 py-3 text-base font-semibold text-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-orange-600 py-3 text-base font-semibold text-white hover:opacity-90"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
