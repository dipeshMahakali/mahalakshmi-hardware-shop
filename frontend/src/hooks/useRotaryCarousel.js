import { useRef, useState, useEffect, useCallback } from 'react';

export function useRotaryCarousel({
  itemsLength = 8,
  basePixelsPerSecond = 90,
  stepDistance = 314
}) {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  // Initialize track to the middle set for seamless infinite rotation
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth > 0 && el.scrollLeft === 0) {
      el.scrollLeft = singleSetWidth;
    }
  }, [itemsLength]);

  // Continuous Dynamic 60fps Disk Rotation Engine
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationId;
    let lastTime = null;

    const step = (time) => {
      if (lastTime !== null && trackRef.current && !isPaused && !isHovered && !isMouseDown) {
        const delta = (time - lastTime) / 1000;
        const el = trackRef.current;
        const singleSetWidth = el.scrollWidth / 3;

        if (singleSetWidth > 0) {
          const effectiveSpeed = basePixelsPerSecond * speedMultiplier;
          el.scrollLeft += effectiveSpeed * delta;

          // Seamless infinite circular wrap
          if (el.scrollLeft >= singleSetWidth * 2) {
            el.scrollLeft -= singleSetWidth;
          } else if (el.scrollLeft <= 0) {
            el.scrollLeft += singleSetWidth;
          }
        }
      }
      lastTime = time;
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPaused, isHovered, isMouseDown, speedMultiplier, basePixelsPerSecond, itemsLength]);

  // Pause when browser tab is inactive to preserve battery & GPU cycles
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Manual Step Rotation (Infinite Bidirectional)
  const rotateStep = useCallback((direction) => {
    const el = trackRef.current;
    if (!el) return;
    const singleSetWidth = el.scrollWidth / 3;

    if (singleSetWidth > 0) {
      if (el.scrollLeft >= singleSetWidth * 2) {
        el.scrollLeft -= singleSetWidth;
      } else if (el.scrollLeft <= singleSetWidth * 0.5) {
        el.scrollLeft += singleSetWidth;
      }
    }

    el.scrollBy({ left: direction * stepDistance, behavior: 'smooth' });
  }, [stepDistance]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      rotateStep(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      rotateStep(1);
    }
  }, [rotateStep]);

  // Drag-to-spin Mouse Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, select')) return;

    setIsMouseDown(true);
    setHasDragged(false);
    dragStartX.current = e.pageX;
    dragStartScrollLeft.current = trackRef.current ? trackRef.current.scrollLeft : 0;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !trackRef.current) return;
    e.preventDefault();
    const diff = (e.pageX - dragStartX.current) * 1.3;
    if (Math.abs(diff) > 4) {
      setHasDragged(true);
    }
    const el = trackRef.current;
    el.scrollLeft = dragStartScrollLeft.current - diff;

    // Seamless wrap during drag
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth > 0) {
      if (el.scrollLeft >= singleSetWidth * 2) {
        el.scrollLeft -= singleSetWidth;
        dragStartScrollLeft.current -= singleSetWidth;
      } else if (el.scrollLeft <= singleSetWidth * 0.5) {
        el.scrollLeft += singleSetWidth;
        dragStartScrollLeft.current += singleSetWidth;
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleClickCapture = (e) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => setHasDragged(false), 50);
    }
  };

  return {
    trackRef,
    isPaused,
    setIsPaused,
    isHovered,
    setIsHovered,
    isMouseDown,
    hasDragged,
    speedMultiplier,
    setSpeedMultiplier,
    rotateStep,
    handleKeyDown,
    containerProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => { setIsHovered(false); setIsMouseDown(false); },
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: () => setIsHovered(true),
      onTouchEnd: () => { setTimeout(() => setIsHovered(false), 2000); },
      onClickCapture: handleClickCapture
    }
  };
}
