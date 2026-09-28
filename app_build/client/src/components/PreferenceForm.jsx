// PreferenceForm.jsx — 6-step form with proper per-step validation

import { useState } from 'react';
import { Stepper, Step } from './Stepper';

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
];

const PREFERRED_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'any',    label: 'Anyone' },
];

// Validate each step. Returns { valid: bool, error: string|null }
function validateStep(step, formData) {
  switch (step) {
    case 0: // Welcome — always ok
      return { valid: true, error: null };

    case 1: { // Age
      const age = Number(formData.age);
      if (formData.age === '') return { valid: false, error: 'Please enter your age.' };
      if (isNaN(age))          return { valid: false, error: 'Age must be a number.' };
      if (age < 18)            return { valid: false, error: 'You must be 18 or older to use ChatWithMe.' };
      if (age > 120)           return { valid: false, error: 'Please enter a valid age.' };
      return { valid: true, error: null };
    }

    case 2: // Gender
      if (!formData.gender) return { valid: false, error: 'Please select your gender.' };
      return { valid: true, error: null };

    case 3: // Preferred gender
      if (!formData.preferredGender) return { valid: false, error: 'Please select who you want to chat with.' };
      return { valid: true, error: null };

    case 4: // City — optional
      return { valid: true, error: null };

    case 5: // Confirm — always ok
      return { valid: true, error: null };

    default:
      return { valid: true, error: null };
  }
}

export default function PreferenceForm({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '', gender: '', preferredGender: '', city: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [touched, setTouched]         = useState(false); // whether user tried to advance

  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(false);
  };

  const { valid: canAdvance, error: validationError } = validateStep(currentStep, formData);

  const handleStepChange = (newStep) => {
    setTouched(false);
    setCurrentStep(newStep);
  };

  return (
    <Stepper
      onFinalStepCompleted={() => onComplete(formData)}
      onStepChange={handleStepChange}
      backButtonText="← Back"
      nextButtonText="Continue"
      canAdvance={canAdvance}
    >
      {/* ── Step 0: Welcome ─────────────────────────── */}
      <Step>
        <div style={{ paddingBottom: 8 }}>
          <h2>Welcome to ChatWithMe</h2>
          <p>Connect with strangers anonymously. No sign-up, no history — just genuine conversations.</p>
          <div className="welcome-features">
            <div className="welcome-feature">
              Fully anonymous — no account needed
            </div>
            <div className="welcome-feature">
              Instant matching by your preferences
            </div>
            <div className="welcome-feature">
              Messages are never stored or logged
            </div>
          </div>
        </div>
      </Step>

      {/* ── Step 1: Age ─────────────────────────────── */}
      <Step>
        <h2>How old are you?</h2>
        <p>You must be <strong>18 or older</strong> to use ChatWithMe.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="step-default">
          <input
            id="age-input"
            type="number"
            className="input"
            min={18}
            max={120}
            value={formData.age}
            onChange={(e) => set('age', e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. 24"
            autoFocus
            style={{
              borderColor: touched && validationError && currentStep === 1 ? '#dc2626' : undefined,
            }}
          />
          {/* Show error if user touched the field or tried to advance */}
          {(touched || formData.age !== '') && validationError && currentStep === 1 && (
            <div className="field-error">{validationError}</div>
          )}
          {/* Show success if valid */}
          {formData.age !== '' && !validationError && (
            <div style={{ fontSize: '0.8125rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
              Looks good!
            </div>
          )}
        </div>
      </Step>

      {/* ── Step 2: Gender ──────────────────────────── */}
      <Step>
        <h2>Your gender</h2>
        <p>This helps us find compatible chat partners.</p>
        <div className="option-cards">
          {GENDER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              id={`gender-${opt.value}`}
              type="button"
              className={`option-card ${formData.gender === opt.value ? 'selected' : ''}`}
              onClick={() => set('gender', opt.value)}
            >
              <span className="option-card-label">{opt.label}</span>
            </button>
          ))}
        </div>
        {touched && !formData.gender && (
          <div className="field-error" style={{ marginTop: 10 }}>Please select your gender to continue.</div>
        )}
      </Step>

      {/* ── Step 3: Preferred gender ─────────────────── */}
      <Step>
        <h2>Who do you want to chat with?</h2>
        <p>Matching is mutual — both users must consent to the pairing.</p>
        <div className="option-cards">
          {PREFERRED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              id={`pref-${opt.value}`}
              type="button"
              className={`option-card ${formData.preferredGender === opt.value ? 'selected' : ''}`}
              onClick={() => set('preferredGender', opt.value)}
            >
              <span className="option-card-label">{opt.label}</span>
            </button>
          ))}
        </div>
        {touched && !formData.preferredGender && (
          <div className="field-error" style={{ marginTop: 10 }}>Please choose your preference to continue.</div>
        )}
      </Step>

      {/* ── Step 4: City ─────────────────────────────── */}
      <Step>
        <h2>
          Your city{' '}
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#8696a0' }}>(optional)</span>
        </h2>
        <p>We'll try to match you with someone nearby first.</p>
        <div className="step-default">
          <input
            id="city-input"
            type="text"
            className="input"
            value={formData.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="e.g. Mumbai"
            maxLength={100}
          />
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#8696a0', marginTop: 6 }}>
          You can skip this — city is never shared with your chat partner.
        </div>
      </Step>

      {/* ── Step 5: Confirm ──────────────────────────── */}
      <Step>
        <h2>Ready to connect?</h2>
        <p>Your anonymous profile for this session:</p>
        <div className="confirm-summary">
          <div className="confirm-row">
            <span className="confirm-row-label">Age</span>
            <span className="confirm-row-value">{formData.age}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-row-label">Gender</span>
            <span className="confirm-row-value">{formData.gender}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-row-label">Looking for</span>
            <span className="confirm-row-value">
              {formData.preferredGender === 'any' ? 'Anyone' : formData.preferredGender}
            </span>
          </div>
          {formData.city && (
            <div className="confirm-row">
              <span className="confirm-row-label">City</span>
              <span className="confirm-row-value">{formData.city}</span>
            </div>
          )}
        </div>
        <div style={{
          marginTop: 14, padding: '10px 14px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 12, fontSize: '0.8125rem', color: '#64748b',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          Your data is never stored and deleted when you disconnect.
        </div>
      </Step>
    </Stepper>
  );
}
