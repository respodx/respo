import React, { useEffect, useState, useCallback } from 'react';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ScrollIndicator({ containerRef }: ScrollIndicatorProps) {
  const [scrollState, setScrollState] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
  });

  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);

  const updateMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setScrollState({
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
    });
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      updateMetrics();
    };

    updateMetrics();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, updateMetrics]);

  const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } =
    scrollState;

  const canScrollX = scrollWidth > clientWidth + 4;
  const canScrollY = scrollHeight > clientHeight + 4;

  if (!canScrollX && !canScrollY) return null;

  // Horizontal metrics
  const trackWidthX = Math.max(120, Math.min(420, clientWidth - 120));
  const thumbWidthRatio = scrollWidth > 0 ? clientWidth / scrollWidth : 1;
  const thumbWidthX = Math.max(36, trackWidthX * thumbWidthRatio);
  const maxScrollLeft = Math.max(1, scrollWidth - clientWidth);
  const maxThumbLeft = Math.max(1, trackWidthX - thumbWidthX);
  const thumbLeftX = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;

  // Vertical metrics
  const trackHeightY = Math.max(100, Math.min(320, clientHeight - 120));
  const thumbHeightRatio = scrollHeight > 0 ? clientHeight / scrollHeight : 1;
  const thumbHeightY = Math.max(32, trackHeightY * thumbHeightRatio);
  const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
  const maxThumbTop = Math.max(1, trackHeightY - thumbHeightY);
  const thumbTopY = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

  // Drag handlers for horizontal scroll
  const handlePointerDownX = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < thumbLeftX || clickX > thumbLeftX + thumbWidthX) {
      const targetRatio = (clickX - thumbWidthX / 2) / maxThumbLeft;
      container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetRatio * maxScrollLeft));
    }

    const startX = e.clientX;
    const startScrollLeft = container.scrollLeft;
    setIsDraggingX(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaScroll = (deltaX / maxThumbLeft) * maxScrollLeft;
      container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, startScrollLeft + deltaScroll));
    };

    const onPointerUp = () => {
      setIsDraggingX(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Drag handlers for vertical scroll
  const handlePointerDownY = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    if (clickY < thumbTopY || clickY > thumbTopY + thumbHeightY) {
      const targetRatio = (clickY - thumbHeightY / 2) / maxThumbTop;
      container.scrollTop = Math.max(0, Math.min(maxScrollTop, targetRatio * maxScrollTop));
    }

    const startY = e.clientY;
    const startScrollTop = container.scrollTop;
    setIsDraggingY(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaScroll = (deltaY / maxThumbTop) * maxScrollTop;
      container.scrollTop = Math.max(0, Math.min(maxScrollTop, startScrollTop + deltaScroll));
    };

    const onPointerUp = () => {
      setIsDraggingY(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="rdx-scroll-indicator-layer rdx-scroll-indicator-layer--constant" aria-hidden="true">
      {/* Horizontal Scroll Track */}
      {canScrollX && (
        <div
          className="rdx-scroll-track rdx-scroll-track--x"
          style={{ width: trackWidthX }}
          onPointerDown={handlePointerDownX}
          title="Pan horizontally"
        >
          <div
            className={`rdx-scroll-thumb rdx-scroll-thumb--x${
              isDraggingX ? ' rdx-scroll-thumb--dragging' : ''
            }`}
            style={{
              width: thumbWidthX,
              transform: `translateX(${thumbLeftX}px)`,
            }}
          />
        </div>
      )}

      {/* Vertical Scroll Track */}
      {canScrollY && (
        <div
          className="rdx-scroll-track rdx-scroll-track--y"
          style={{ height: trackHeightY }}
          onPointerDown={handlePointerDownY}
          title="Pan vertically"
        >
          <div
            className={`rdx-scroll-thumb rdx-scroll-thumb--y${
              isDraggingY ? ' rdx-scroll-thumb--dragging' : ''
            }`}
            style={{
              height: thumbHeightY,
              transform: `translateY(${thumbTopY}px)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
