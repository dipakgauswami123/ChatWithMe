// Stepper.jsx — Animated multi-step form component using Motion

import { useState, Children } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './Stepper.css';

const STEP_LABELS = ['Welcome', 'Age', 'Gender', 'Preference', 'City', 'Confirm'];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  }),
};

/**
 * Stepper — wraps child <Step> components.
 *
 * Props:
 *   onFinalStepCompleted(formData) — called when last step's primary action fires
 *   backButtonText  — label for back button (default: "Back")
 *   nextButtonText  — label for next button (default: "Continue")
 *   canAdvance      — boolean, controls whether "Continue" is enabled (default: true)
 */
export function Stepper({
  children,
  onFinalStepCompleted,
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  canAdvance = true,
  onStepChange,
}) {
  const steps = Children.toArray(children);
  const total = steps.length;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < total - 1) {
      setDirection(1);
      const next = current + 1;
      setCurrent(next);
      onStepChange?.(next);
    } else {
      onFinalStepCompleted?.();
    }
  };

  const goBack = () => {
    if (current > 0) {
      setDirection(-1);
      const prev = current - 1;
      setCurrent(prev);
      onStepChange?.(prev);
    }
  };

  const isLast = current === total - 1;

  return (
    <div className="stepper-root">
      {/* ── Progress ─────────────────────────────────── */}
      <div className="stepper-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
        {steps.map((_, i) => (
          <div
            key={i}
            className={`stepper-progress-item ${i === current ? 'active' : ''} ${i < current ? 'completed' : ''}`}
          >
            <div className="stepper-step-circle">
              {i < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="stepper-step-label">{STEP_LABELS[i] ?? `Step ${i + 1}`}</span>
          </div>
        ))}
      </div>

      {/* ── Animated Step Content ────────────────────── */}
      <div className="stepper-content">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="stepper-step"
          >
            {steps[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ──────────────────────────────── */}
      <div className="stepper-nav">
        {current > 0 ? (
          <button id={`stepper-back-${current}`} className="btn btn-ghost" onClick={goBack}>
            {backButtonText}
          </button>
        ) : (
          <div className="stepper-nav-spacer" />
        )}

        <button
          id={`stepper-next-${current}`}
          className="btn btn-primary"
          onClick={goNext}
          disabled={!canAdvance}
        >
          {isLast ? 'Find a Match' : `${nextButtonText}`}
        </button>
      </div>
    </div>
  );
}

/**
 * Step — child wrapper for each step's content.
 */
export function Step({ children }) {
  return <div className="step-inner">{children}</div>;
}

export default Stepper;
