// QueueStatus.jsx — Professional matchmaking waiting screen

import { motion } from 'motion/react';

export default function QueueStatus({ onCancel }) {
  return (
    <div id="queue-status" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '8px 0' }}>
      {/* Radar rings in blue */}
      <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', borderRadius: '50%',
              border: '2px solid #3b82f6',
              width: 32 + i * 22, height: 32 + i * 22,
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55 }}
          />
        ))}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', position: 'relative', zIndex: 1,
          boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
        }}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          Finding your match…
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Looking for a compatible stranger.<br />This usually takes a few seconds.
        </p>
      </div>

      {/* Blue bouncing dots */}
      <div style={{ display: 'flex', gap: 7 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}
            animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <button id="cancel-queue-btn" onClick={onCancel} style={{
        padding: '8px 20px', fontSize: '0.875rem', fontWeight: 500,
        color: '#64748b', background: '#f1f5f9',
        border: '1px solid #cbd5e1', borderRadius: 999, cursor: 'pointer',
        transition: 'all 0.15s',
      }}>
        Cancel Matchmaking
      </button>
    </div>
  );
}
