import React from 'react';
import { AlertOctagon, RefreshCw, Landmark, HelpCircle } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const ProblemSection = () => {
  const problems = [
    {
      icon: AlertOctagon,
      title: 'Unexpected Cost Spikes',
      description: 'Hidden API charges, traffic surges, or misconfigured VMs that run up bills of thousands of dollars overnight without warning.',
      color: 'border-red-500/10 text-red-400 bg-red-500/5',
    },
    {
      icon: RefreshCw,
      title: 'Unused Resources',
      description: 'Idle dev sandboxes, orphaned EBS volumes, and oversized compute blocks running endlessly, draining budgets without usage.',
      color: 'border-yellow-500/10 text-yellow-400 bg-yellow-500/5',
    },
    {
      icon: Landmark,
      title: 'Budget Breaches',
      description: 'FinOps teams learning about cost overruns 30 days after they occur, making budget adjustments retrospective and ineffective.',
      color: 'border-orange-500/10 text-orange-400 bg-orange-500/5',
    },
    {
      icon: HelpCircle,
      title: 'Multi-Cloud Complexity',
      description: 'Deciphering billing logs across AWS, GCP, and Azure with different naming conventions and tags, creating massive visibility blindspots.',
      color: 'border-blue-500/10 text-blue-400 bg-blue-500/5',
    },
  ];

  return (
    <section id="solutions" className="relative py-24 overflow-hidden" style={{ backgroundColor: 'var(--color-navy-dark)' }}>
      {/* Subtle floating radial glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#FF0080] uppercase tracking-widest">The Challenge</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Why Cloud Costs Become Unpredictable
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            Without machine intelligence and continuous anomaly detection, engineering velocity inevitably turns into cloud cost waste.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((prob, index) => {
            const IconComp = prob.icon;
            return (
              <TiltCard
                key={index}
                className={`glass-card p-6 sm:p-8 rounded-2xl border ${prob.color}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-inherit shrink-0">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{prob.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{prob.description}</p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default ProblemSection;
