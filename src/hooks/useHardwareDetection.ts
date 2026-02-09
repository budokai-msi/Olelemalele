'use client';

import { useEffect, useState } from 'react';

export function useHardwareDetection() {
  const [capabilities, setCapabilities] = useState({
    webGL: false,
    webGL2: false,
    performance: 'unknown' as 'low' | 'medium' | 'high' | 'unknown',
    supportsShadows: true,
  });

  useEffect(() => {
    const detectCapabilities = () => {
      // Check for WebGL support
      const canvas = document.createElement('canvas');
      const gl1 = !!window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));

      // Check for WebGL2 support
      const gl2 = !!window.WebGL2RenderingContext &&
        canvas.getContext('webgl2');

      const hasWebGL = !!gl1;
      const hasWebGL2 = !!gl2;

      // Explicitly lose contexts to free GPU resources
      const loseExt1 = gl1 && (gl1 as WebGLRenderingContext).getExtension?.('WEBGL_lose_context');
      if (loseExt1) loseExt1.loseContext();
      const loseExt2 = gl2 && (gl2 as WebGL2RenderingContext).getExtension?.('WEBGL_lose_context');
      if (loseExt2) loseExt2.loseContext();
      // Canvas is not appended to DOM so it will be GC'd

      // Simple performance estimation based on device memory and hardware concurrency
      // @ts-ignore - navigator.deviceMemory might not be defined in all browsers
      const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
      // @ts-ignore - navigator.hardwareConcurrency might not be defined in all browsers
      const hardwareConcurrency = navigator.hardwareConcurrency || 4; // Default to 4 cores

      let performanceLevel: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';

      if (deviceMemory < 4 || hardwareConcurrency < 4) {
        performanceLevel = 'low';
      } else if (deviceMemory < 8 || hardwareConcurrency < 8) {
        performanceLevel = 'medium';
      } else {
        performanceLevel = 'high';
      }

      // Determine if shadows should be enabled based on performance
      const supportsShadows = performanceLevel !== 'low';

      setCapabilities({
        webGL: hasWebGL,
        webGL2: hasWebGL2,
        performance: performanceLevel,
        supportsShadows
      });
    };

    // Run detection after a small delay to allow browser to initialize
    const timer = setTimeout(detectCapabilities, 100);

    return () => clearTimeout(timer);
  }, []);

  return capabilities;
}
