import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TrendingUp, AlertTriangle, Lightbulb, DollarSign, Calendar, ArrowRight } from 'lucide-react';

export const DashboardPreviewSection = () => {
  const { token } = useAuth();

  return (
    <section id="dashboard-preview" className="relative py-24 bg-navy-deep overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Interactive Console</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Dynamic FinOps Dashboard
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            Take control of your infrastructure budget with real-time forecasting, anomaly signals, and recommendation layers.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="glass-card rounded-2xl border border-white/5 shadow-2xl p-6 sm:p-8 mb-10 overflow-hidden relative">
          
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary/10 to-gold/10 rounded-2xl blur-[8px] opacity-25 z-0 pointer-events-none" />

          {/* Console Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-6 mb-6 relative z-10">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Prediction Orbit</span>
              <h3 className="text-xl font-bold text-white mt-1">Multi-Cloud Overview</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">AWS / AZURE / GCP consolidated logs</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Card 1: Current Spend */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Month Spend</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-3xl font-black text-white mt-4">$64,380</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Updated 1hr ago</span>
              </div>
            </div>

            {/* Card 2: Predicted Spend */}
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Forecasted Spend</p>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-black text-white mt-4">$71,450</p>
              <span className="mt-3 inline-flex items-center gap-0.5 text-xs text-primary font-semibold">
                XGBoost Prediction +/- 0.8%
              </span>
            </div>

            {/* Card 3: Anomalies */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-red-500/20 transition-all">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Anomalies</p>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <p className="text-3xl font-black text-red-400 mt-4">2 Spike Signals</p>
              <span className="mt-3 inline-flex items-center gap-0.5 text-xs text-red-500 font-semibold">
                High critical cost warnings
              </span>
            </div>

            {/* Card 4: Savings Recommendations */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-green-500/20 transition-all">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Savings Found</p>
                <Lightbulb className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-3xl font-black text-green-400 mt-4">$12,890 / mo</p>
              <span className="mt-3 inline-flex items-center gap-0.5 text-xs text-green-500 font-semibold">
                8 active rightsizing paths
              </span>
            </div>
          </div>

          {/* Simulating Cost Trend Chart placeholder */}
          <div className="mt-6 p-6 rounded-xl bg-white/[0.01] border border-white/5 relative z-10 flex flex-col justify-between h-[200px]">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Forecast Cost Trend Chart</span>
              <span className="text-primary font-bold">AWS Compute / DB cost segments</span>
            </div>
            
            {/* Visual simulation of bars / waves */}
            <div className="flex items-end gap-3.5 h-[100px] w-full justify-between pt-4">
              {[40, 55, 45, 60, 75, 65, 80, 95, 85, 100].map((h, i) => (
                <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      i === 7 || i === 8 || i === 9
                        ? 'bg-gradient-to-t from-primary/30 to-primary/80 border-t border-primary/50'
                        : 'bg-white/5 group-hover:bg-white/10'
                    }`}
                  />
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            to={token ? '/dashboard' : '/login'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-8 py-4 text-base font-bold text-white hover:opacity-95 shadow-lg shadow-primary/20 glow-button transition-all"
          >
            Explore Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};
export default DashboardPreviewSection;
