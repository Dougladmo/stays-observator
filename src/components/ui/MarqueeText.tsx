import { useRef, useLayoutEffect, useState } from 'react';

interface MarqueeTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // pixels per second
  enabled?: boolean; // manual override
}

export default function MarqueeText({
  children,
  className = '',
  speed = 20,
  enabled,
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalContentRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const originalContent = originalContentRef.current;

    if (!container || !originalContent) return;

    const checkOverflow = () => {
      const containerWidth = container.clientWidth;
      // Measure only the original content, not the duplicate
      const originalWidth = originalContent.scrollWidth;
      const hasOverflow = originalWidth > containerWidth;

      // Use manual override if provided, otherwise auto-detect
      const shouldScroll = enabled !== undefined ? enabled : hasOverflow;

      setShouldAnimate(shouldScroll);

      if (shouldScroll && hasOverflow) {
        // Store original content width + gap for animation distance
        setContentWidth(originalWidth + 50); // 50px is the gap between original and duplicate
      }
    };

    // Check overflow immediately
    checkOverflow();

    // Re-check on resize
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled, children]);

  // Calculate animation duration based on content width and speed
  const animationDuration = contentWidth / speed;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className={`inline-flex items-center whitespace-nowrap ${shouldAnimate ? 'marquee-animate' : ''}`}
        style={{
          '--scroll-distance': `-${contentWidth}px`,
          '--animation-duration': `${animationDuration}s`,
        } as React.CSSProperties}
      >
        <div ref={originalContentRef} className="inline-flex items-center gap-[inherit]">
          {children}
        </div>
        {/* Duplicate content for seamless loop */}
        {shouldAnimate && (
          <div className="inline-flex items-center gap-[inherit] ml-[50px]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
