import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './Icons.js';

interface TourStep {
  stepNumber: string;
  targetSelector: string;
  title: string;
  description: string;
}

const DEFAULT_STEP: TourStep = {
  stepNumber: '01 / 04',
  targetSelector: '.rdx-dock__presets',
  title: 'Viewport Presets',
  description: 'Toggle Mobile, Tablet, or Desktop frames to customize your active testing layout.',
};

const TOUR_STEPS: TourStep[] = [
  DEFAULT_STEP,
  {
    stepNumber: '02 / 04',
    targetSelector: '.rdx-frame-slot',
    title: 'Live DOM Mirroring',
    description: 'Scroll, type in forms, and click links — interactions mirror across all viewports in real time.',
  },
  {
    stepNumber: '03 / 04',
    targetSelector: '.rdx-frame-zoom-btn',
    title: 'Single-View Focus',
    description: 'Click [ ⛶ FOCUS ] on any frame header to center and zoom that device to 100% full view.',
  },
  {
    stepNumber: '04 / 04',
    targetSelector: '.rdx-dock__actions',
    title: 'Shortcuts & Help',
    description: 'Press Escape anytime to exit focus or close the workbench. Replay this tour using [ ? ].',
  },
];

interface OnboardingTourProps {
  onClose: () => void;
  rootElement?: HTMLElement | null | undefined;
}

export function OnboardingTour({ onClose, rootElement }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const step: TourStep = TOUR_STEPS[currentStep] ?? DEFAULT_STEP;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Measure and elevate the active target element above the tour backdrop
  useEffect(() => {
    const scope = rootElement ?? document;
    let activeEl: HTMLElement | null = null;

    function updateRect() {
      if (activeEl) {
        activeEl.classList.remove('rdx-tour-highlighted');
      }

      const target = scope.querySelector(step.targetSelector) as HTMLElement | null;
      if (target) {
        activeEl = target;
        activeEl.classList.add('rdx-tour-highlighted');
        setTargetRect(target.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    }

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    const timer = setTimeout(updateRect, 100);

    return () => {
      if (activeEl) {
        activeEl.classList.remove('rdx-tour-highlighted');
      }
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearTimeout(timer);
    };
  }, [currentStep, step.targetSelector, rootElement]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && !isLast) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        setCurrentStep((prev) => prev - 1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirst, isLast, onClose]);

  // Compute tooltip position and arrow alignment directly to target center
  let tooltipStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  let isPlacedAbove = false;
  let arrowLeft = 32;
  const tooltipWidth = 320;

  if (targetRect) {
    const margin = 14;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    let left = targetCenterX - tooltipWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left));

    let top = targetRect.bottom + margin;
    // If not enough room below, place above target
    if (top + 160 > window.innerHeight && targetRect.top > 170) {
      top = targetRect.top - 160 - margin;
      isPlacedAbove = true;
    }

    // Align arrow directly to target element's center
    arrowLeft = Math.max(16, Math.min(tooltipWidth - 24, targetCenterX - left - 5));

    tooltipStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    };
  }

  return (
    <div className="rdx-tour-container" role="dialog" aria-label="Interactive Tour">
      {/* Dimmed background with click-to-dismiss */}
      <div className="rdx-tour-backdrop" onClick={onClose} />

      {/* Floating Anchored Tooltip Card */}
      <div
        ref={tooltipRef}
        className="rdx-tour-tooltip"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointer Arrow pointing directly at target element */}
        {targetRect && (
          <div
            className={`rdx-tour-arrow ${isPlacedAbove ? 'rdx-tour-arrow--bottom' : 'rdx-tour-arrow--top'}`}
            style={{ left: `${arrowLeft}px` }}
          />
        )}

        {/* Header */}
        <div className="rdx-tour-tooltip__header">
          <span className="rdx-tour-tooltip__badge">TOUR &bull; {step.stepNumber}</span>
          <button
            className="rdx-tour-tooltip__close"
            onClick={onClose}
            aria-label="Skip tour"
            title="Skip tour (Esc)"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="rdx-tour-tooltip__body">
          <h4 className="rdx-tour-tooltip__title">{step.title}</h4>
          <p className="rdx-tour-tooltip__desc">{step.description}</p>
        </div>

        {/* Footer */}
        <div className="rdx-tour-tooltip__footer">
          <button className="rdx-tour-tooltip__btn rdx-tour-tooltip__btn--ghost" onClick={onClose}>
            SKIP
          </button>

          <div className="rdx-tour-tooltip__nav">
            {!isFirst && (
              <button
                className="rdx-tour-tooltip__btn rdx-tour-tooltip__btn--sec"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                &larr; BACK
              </button>
            )}
            {isLast ? (
              <button
                className="rdx-tour-tooltip__btn rdx-tour-tooltip__btn--pri"
                onClick={onClose}
              >
                FINISH
              </button>
            ) : (
              <button
                className="rdx-tour-tooltip__btn rdx-tour-tooltip__btn--pri"
                onClick={() => setCurrentStep((prev) => prev + 1)}
              >
                NEXT &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
