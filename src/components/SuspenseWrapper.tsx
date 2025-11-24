// src/components/SuspenseWrapper.tsx
import React, { useState, useEffect, useRef, Suspense } from 'react';

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading when 200px away from the viewport
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: '500px' }}> {/* Placeholder height to prevent CLS */}
      {isVisible ? <Suspense fallback={<div />}>{children}</Suspense> : null}
    </div>
  );
};

export default SuspenseWrapper;