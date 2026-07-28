import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const isLandingPage = location.pathname === '/';

  const navItems = [
    { name: 'Features', id: 'features', type: 'scroll' },
    { name: 'Solutions', id: 'solutions', type: 'scroll' },
    { name: 'Technology', id: 'technology', type: 'scroll' },
    { name: 'Pricing', id: 'pricing', type: 'scroll' },
    { name: 'About', id: 'about', type: 'scroll' },
    ...(user
      ? [
          { name: 'Dashboard', to: '/dashboard', type: 'link' },
          { name: 'Predictions', to: '/predictions', type: 'link' },
          ...(user.role === 'super_admin' || user.role === 'admin'
            ? [
                { name: 'Analytics', to: '/analytics', type: 'link' },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 animate-nav-slide">
      <nav
        className={`mx-auto max-w-7xl rounded-2xl border transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) ${
          scrolled
            ? 'bg-[#05070c]/85 backdrop-blur-xl border-[#06B6D4]/20 py-1.5 shadow-lg shadow-black/50'
            : 'bg-[#05070c]/45 backdrop-blur-md border-white/5 py-2.5'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#06B6D4] to-[#22C55E] p-[1px] shadow-lg shadow-[#06B6D4]/20 transition-transform group-hover:scale-105">
                  <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#05070c]">
                    <Activity className="h-4.5 w-4.5 text-[#06B6D4] animate-pulse" />
                  </div>
                </div>
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#06B6D4] transition-colors">
                  CloudAtlas <span className="text-[#06B6D4]">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center gap-8">
                {navItems.map((item) => {
                  if (item.type === 'scroll') {
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavClick(item.id)}
                        className="text-sm font-medium text-gray-300 hover:text-primary hover:glow-text transition-all duration-300 cursor-pointer"
                      >
                        {item.name}
                      </button>
                    );
                  } else {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.name}
                        to={item.to}
                        className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                          isActive
                            ? 'text-primary font-semibold hover:glow-text'
                            : 'text-gray-300 hover:glow-text'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  }
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4 relative">
                  {isLandingPage && (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-4.5 py-2 text-xs font-semibold text-white hover:opacity-90 glow-button"
                    >
                      Go to Console
                    </Link>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="group flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all duration-300 cursor-pointer relative"
                    >
                      {/* Glowing status ring wrapper */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#06B6D4] to-[#22C55E] p-[1.5px] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-12">
                          <div className="w-full h-full rounded-full bg-[#05070c] flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
                            {user.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                        </div>
                        {/* Active green status dot */}
                        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-navy-deep animate-pulse" />
                      </div>
                      <div className="text-left hidden lg:block">
                        <span className="block text-[11px] font-semibold text-gray-200 group-hover:text-primary transition-colors leading-tight">
                          {user.name}
                        </span>
                        <span className="block text-[8px] text-gray-400 font-medium uppercase tracking-wider leading-none mt-0.5">
                          {user.role}
                        </span>
                      </div>
                      {/* Subtle Chevron indicator */}
                      <svg
                        className={`h-3.5 w-3.5 text-gray-400 group-hover:text-primary transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-navy-deep/95 border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in animate-modal-enter">
                          <div className="px-4 py-3 border-b border-white/5 mb-1.5">
                            <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-primary font-semibold uppercase mt-0.5">{user.role}</p>
                          </div>
                          
                          <Link
                            to="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            Console Dashboard
                          </Link>
                          
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            User Profile
                          </Link>

                          {(user.role === 'super_admin' || user.role === 'admin') && (
                            <>
                              <Link
                                to="/users"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                User Management
                              </Link>
                              <Link
                                to="/upload"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                Upload Datasets
                              </Link>
                              <Link
                                to="/analytics"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                Analytics Panel
                              </Link>
                              <Link
                                to="/predictions"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                Predictions Console
                              </Link>
                              <Link
                                to="/model-training"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                Model Training
                              </Link>
                            </>
                          )}

                          <hr className="border-white/5 my-1.5" />

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              logout(navigate);
                            }}
                            className="w-full text-left flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-semibold cursor-pointer"
                          >
                            Logout Session
                          </button>
                        </div>
                      </>
                    )}
                  </div>
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
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-4.5 py-2 text-xs font-semibold text-white hover:opacity-90 glow-button transition-all"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none"
              >
                {isOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 rounded-xl bg-navy-deep/95 border-t border-white/5 p-4 animate-modal-enter">
            <div className="space-y-1.5 px-2 py-3">
              {navItems.map((item) => {
                if (item.type === 'scroll') {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.id)}
                      className="block w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.name}
                    </button>
                  );
                } else {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.name}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-primary'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                }
              })}

              <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                {user ? (
                  <div className="px-2">
                    <p className="text-xs text-gray-400 mb-3">
                      Signed in as <span className="font-semibold text-white">{user.name}</span>
                    </p>
                    <div className="flex flex-col gap-2 mb-3">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                      >
                        Console Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                      >
                        User Profile
                      </Link>
                      {(user.role === 'super_admin' || user.role === 'admin') && (
                        <>
                          <Link
                            to="/upload"
                            onClick={() => setIsOpen(false)}
                            className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                          >
                            Upload Datasets
                          </Link>
                          <Link
                            to="/analytics"
                            onClick={() => setIsOpen(false)}
                            className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                          >
                            Analytics Panel
                          </Link>
                          <Link
                            to="/predictions"
                            onClick={() => setIsOpen(false)}
                            className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                          >
                            Predictions Console
                          </Link>
                          <Link
                            to="/model-training"
                            onClick={() => setIsOpen(false)}
                            className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                          >
                            Model Training
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          logout(navigate);
                          setIsOpen(false);
                        }}
                        className="flex justify-center items-center rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 w-full cursor-pointer transition-colors"
                      >
                        Logout Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-2 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex justify-center items-center rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-orange-600 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
export default Navbar;
