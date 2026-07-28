import React from 'react';
import { Database, FileSpreadsheet, Eye, Brain, LineChart, Cpu, LayoutDashboard, ChevronDown } from 'lucide-react';

export const WorkflowSection = () => {
  const steps = [
    {
      id: '01',
      icon: Database,
      title: 'Upload Billing Data',
      description: 'Ingest billing history CSV/JSON dumps or link active AWS CUR / Azure cost reports directly.',
    },
    {
      id: '02',
      icon: FileSpreadsheet,
      title: 'Data Cleaning',
      description: 'Filter tax overrides, credit refunds, and consolidate tags into uniform organizational departments.',
    },
    {
      id: '03',
      icon: Eye,
      title: 'Exploratory Data Analysis (EDA)',
      description: 'Map baseline runrates, identify recurring cyclical patterns, and isolate idle resource margins.',
    },
    {
      id: '04',
      icon: Brain,
      title: 'Machine Learning Processing',
      description: 'Inject cleaned billing streams into regression ensembles (XGBoost, Random Forest).',
    },
    {
      id: '05',
      icon: LineChart,
      title: 'Forecast Prediction',
      description: 'Synthesize forecasting outputs up to 90 days with precision confidence bands.',
    },
    {
      id: '06',
      icon: Cpu,
      title: 'Cost Optimization Engine',
      description: 'Run constraint optimization heuristics to isolate rightsizing pathways for savings.',
    },
    {
      id: '07',
      icon: LayoutDashboard,
      title: 'Analytics Dashboard',
      description: 'Render predictive models and savings targets onto a premium single-pane FinOps canvas.',
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'var(--color-navy-dark)' }}>
      {/* Background orbs */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#00D4FF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-widest">Pipeline</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Data Pipeline & Forecast Workflow
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            How billing exports convert into precise financial decisions.
          </p>
        </div>

        {/* Vertical timeline layout */}
        <div className="relative border-l border-white/5 ml-4 sm:ml-8 space-y-12 pb-4">
          {steps.map((step, index) => {
            const IconComp = step.icon;
            return (
              <div key={index} className="relative pl-10 sm:pl-16 group">
                
                {/* Timeline node */}
                <div className="absolute left-[-21px] top-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[#020C1B] border border-white/10 text-primary group-hover:border-primary/50 group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                  <IconComp className="h-5 w-5" />
                </div>

                {/* Card container */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 relative">
                  {/* Step ID tag */}
                  <span className="absolute top-4 right-4 text-xs font-black text-white/5 group-hover:text-primary/10 transition-colors text-2xl tracking-wider">
                    {step.id}
                  </span>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{step.description}</p>
                </div>

                {/* Connecting arrow separator */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[-5px] bottom-[-32px] text-white/10 hidden sm:block">
                    <ChevronDown className="h-4.5 w-4.5" />
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default WorkflowSection;
