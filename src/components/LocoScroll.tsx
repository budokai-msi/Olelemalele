'use client'

import { useEffect, useRef } from 'react'

interface LocoScrollProps {
  children: React.ReactNode
}

export default function LocoScroll({ children }: LocoScrollProps) {
  const locoRef = useRef<any>(null)

  useEffect(() => {
    let locoScroll: any;

    // Import and initialize Locomotive Scroll v5
    (async () => {
      try {
        const LocomotiveScrollModule = await import('locomotive-scroll');
        const LocomotiveScroll = LocomotiveScrollModule.default as any;
        locoScroll = new LocomotiveScroll({
          lenisOptions: {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.15,
            duration: 0.8,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
          }
        });

        locoRef.current = locoScroll;
      } catch (error) {
        console.error('Locomotive Scroll initialization failed:', error);
      }
    })();

    return () => {
      if (locoScroll) {
        locoScroll.destroy();
      }
    }
  }, [])

  return (
    <>
      {children}
    </>
  )
}
