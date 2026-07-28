import React from 'react';

export const TrustedTechSection = () => {
  const techs = [
    { name: 'Amazon Web Services', logo: 'AWS' },
    { name: 'Microsoft Azure', logo: 'Azure' },
    { name: 'Google Cloud Platform', logo: 'GCP' },
    { name: 'MongoDB Database', logo: 'MongoDB' },
    { name: 'Node.js Runtime', logo: 'Node.js' },
    { name: 'React.js Frontend', logo: 'React' },
    { name: 'Python Language', logo: 'Python' },
    { name: 'Django Framework', logo: 'Django' },
  ];

  // Double the list for infinite scrolling
  const listItems = [...techs, ...techs, ...techs];

  return (
    <section className="border-y border-white/5 py-12 overflow-hidden" style={{ backgroundColor: 'rgba(7, 19, 15, 0.5)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Trusted integrations & modeling engine compatible with
        </p>
      </div>

      <div className="marquee-container w-full relative">
        {/* Left fade overlay */}
        <div className="absolute top-0 bottom-0 left-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--color-navy-dark), transparent)' }} />
        {/* Right fade overlay */}
        <div className="absolute top-0 bottom-0 right-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--color-navy-dark), transparent)' }} />

        <div className="marquee-content flex gap-16 py-2">
          {listItems.map((tech, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 text-gray-400 hover:text-primary transition-colors cursor-pointer group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/20 text-xs font-black tracking-tighter text-white transition-all">
                {tech.logo[0]}
              </div>
              <span className="text-sm font-semibold tracking-wider uppercase">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TrustedTechSection;
