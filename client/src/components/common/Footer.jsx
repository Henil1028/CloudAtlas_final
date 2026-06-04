import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer id="about" className="relative bg-navy-dark border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-gold p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-navy-deep">
                  <Activity className="h-4.5 w-4.5 text-primary" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                CloudAtlas <span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Predicting cloud bills before they impact budgets. Empowering FinOps teams with machine learning cost forecasting and anomaly detection across multi-cloud environments.
            </p>
            <div className="flex gap-4">
              {/* Github SVG */}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-300" aria-label="GitHub">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              {/* Linkedin SVG */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-300" aria-label="LinkedIn">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* Twitter SVG */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-300" aria-label="Twitter">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="mailto:contact@cloudatlas.ai" className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all duration-300" aria-label="Mail">
                <Mail className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Column 1: Features */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Platform</h4>
            <ul className="space-y-4">
              {['XGBoost Prediction', 'Random Forest Classification', 'Anomaly Alerts', 'Billing Analytics'].map((item) => (
                <li key={item}>
                  <a href="#features" className="text-sm text-gray-400 hover:text-primary transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Documentation */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Resources</h4>
            <ul className="space-y-4">
              {['Documentation', 'API Reference', 'Integrations Guide', 'FinOps Playbook'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Contact Sales', 'Status'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CloudAtlas AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
