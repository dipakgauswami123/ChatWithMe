// FeedbackForm.jsx — Post-chat review & rating form

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const RATING_EMOJIS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
];

const TAGS = ['Friendly', 'Funny', 'Interesting', 'Respectful', 'Good listener', 'Weird', 'Too short', 'Quiet'];

export default function FeedbackForm({ onDone, onFindNew }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      await fetch(`${SERVER_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, selectedTags, comment })
      });
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
    setSubmitted(true);
  };

  const displayRating = hoveredRating || rating;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ textAlign: 'center', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Thanks for your feedback
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Your review helps us improve ChatWithMe for everyone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button id="find-new-after-feedback-btn" className="btn btn-primary" onClick={onFindNew}>
            Find New Match
          </button>
          <button id="done-btn" className="btn btn-secondary" onClick={onDone}>
            Go Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div id="feedback-form" style={{ padding: '28px 28px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          How was your chat?
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Help us improve by sharing your experience
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Rating ─────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, textAlign: 'center' }}>
            Rate your experience
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {RATING_EMOJIS.map(({ value, label }) => (
              <motion.button
                key={value}
                id={`rating-${value}`}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={label}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: displayRating >= value ? '#fff' : '#64748b',
                  background: displayRating >= value ? '#3b82f6' : '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {value}
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {displayRating > 0 && (
              <motion.p
                key={displayRating}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', marginTop: 8, fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' }}
              >
                {RATING_EMOJIS.find(r => r.value === displayRating)?.label}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── Tags ──────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            What stood out? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS.map(tag => (
              <motion.button
                key={tag}
                id={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => toggleTag(tag)}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1.5px solid',
                  transition: 'all 0.15s',
                  background: selectedTags.includes(tag) ? '#eff6ff' : '#f8fafc',
                  borderColor: selectedTags.includes(tag) ? '#3b82f6' : '#e2e8f0',
                  color: selectedTags.includes(tag) ? '#1d4ed8' : '#64748b',
                }}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Comment ───────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Anything else? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </p>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your experience…"
            maxLength={500}
            rows={3}
            className="input"
            style={{ resize: 'vertical' }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
            {comment.length}/500
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" id="skip-feedback-btn" className="btn btn-ghost" onClick={onDone} style={{ fontSize: '0.875rem', padding: '10px 18px' }}>
            Skip
          </button>
          <button
            type="submit"
            id="submit-feedback-btn"
            className="btn btn-primary"
            disabled={rating === 0}
            style={{ fontSize: '0.9375rem' }}
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
