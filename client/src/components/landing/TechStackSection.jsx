import React from 'react';
import { Layout, Server, Brain } from 'lucide-react';

export const TechStackSection = () => {
  const stack = [
    {
      category: 'Frontend Layer',
      icon: Layout,
      color: 'text-primary bg-primary/10 border-primary/20',
      items: [
        { name: 'React.js', version: 'V19 Client' },
        { name: 'Tailwind CSS', version: 'V4 Engine' },
        { name: 'Axios Client', version: 'Service Layer' },
        { name: 'Lucide React', version: 'UI Icon Set' },
      ],
    },
    {
      category: 'Backend Layer',
      icon: Server,
      color: 'text-gold bg-gold/10 border-gold/20',
      items: [
        { name: 'Node.js', version: 'V20 LTS Runtime' },
        { name: 'Express.js', version: 'HTTP API Service' },
        { name: 'MongoDB', version: 'NoSQL Database' },
        { name: 'Mongoose', version: 'ORM Model Layer' },
        { name: 'JWT Auth', version: 'Role RBAC Token' },
      ],
    },
    {
      category: 'AI / Model Layer',
      icon: Brain,
      color: 'text-green-400 bg-green-400/10 border-green-400/20',
      items: [
        { name: 'Python', version: 'Model Dev Environment' },
        { name: 'Django / Pandas', version: 'Data Prep Pipeline' },
        { name: 'Scikit-Learn', version: 'Heuristic Baseline' },
        { name: 'XGBoost', version: 'Main Forecast Model' },
        { name: 'TensorFlow', version: 'Deep Neural Network' },
      ],
    },
  ];

  return (
    <section id="technology" className="relative py-24 bg-navy-deep overflow-hidden">
      {/* Background orbs */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Enterprise Technology Stack
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            Highly optimized technology pipelines providing rapid data ingestion, model processing, and low-latency rendering.
          </p>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stack.map((col, index) => {
            const IconComp = col.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 sm:p-8 border border-white/5 relative overflow-hidden flex flex-col h-full shadow-2xl"
              >
                <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${col.color}`}>
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{col.category}</h3>
                </div>

                <div className="space-y-3.5 flex-grow">
                  {col.items.map((tech, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
                    >
                      <span className="text-sm font-semibold text-white">{tech.name}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md">
                        {tech.version}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default TechStackSection;
