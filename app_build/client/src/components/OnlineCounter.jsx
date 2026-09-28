// OnlineCounter.jsx — Professional live online count

import { motion } from 'motion/react';
import CountUp from './CountUp';

export default function OnlineCounter({ count, isConnected }) {
  return (
    <div
      id="online-counter"
      title="Live online users"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '5px 12px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        borderRadius: '999px',
        transition: 'all 0.3s',
      }}
    >
      <motion.div
        animate={{ scale: isConnected ? [1, 1.4, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isConnected ? '#16a34a' : '#cbd5e1',
          boxShadow: isConnected ? '0 0 6px rgba(22,163,74,0.5)' : 'none',
          flexShrink: 0,
        }}
      />
      {isConnected ? (
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <CountUp from={0} to={count} separator="," duration={0.8} />
          <span style={{ fontWeight: 500, color: '#64748b' }}>online</span>
        </span>
      ) : (
        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Connecting…</span>
      )}
    </div>
  );
}
