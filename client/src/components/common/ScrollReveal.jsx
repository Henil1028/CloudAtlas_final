import React, { useEffect, useRef } from 'react';

export const ScrollReveal = ({ children, threshold = 0.15, className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get all direct children of the container
    const items = Array.from(container.children);
    if (items.length === 0) return;

    // Set initial opacity to 0 so they don't pop/flash before animate
    items.forEach((item) => {
      item.classList.add('reveal-item');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        // Track the count of items intersecting in this batch to stagger delay
        let intersectCount = 0;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            
            // Set the animation with delay index
            target.style.animation = `reveal 0.7s ${intersectCount * 0.15}s forwards ease-out`;
            intersectCount++;
            
            // Unobserve so animation only triggers once
            observer.unobserve(target);
          }
        });
      },
      { threshold }
    );

    items.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      items.forEach((item) => {
        try {
          observer.unobserve(item);
        } catch (e) {
          // Ignore if already unobserved
        }
      });
    };
  }, [children, threshold]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
