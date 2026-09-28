// App.jsx — Root component with full state machine + WhatsApp-style theme

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSocket } from './hooks/useSocket';
import OnlineCounter from './components/OnlineCounter';
import PreferenceForm from './components/PreferenceForm';
import QueueStatus from './components/QueueStatus';
import ChatWindow from './components/ChatWindow';
import FeedbackForm from './components/FeedbackForm';
import ShinyText from './components/ShinyText';
import AnimatedBackground from './components/AnimatedBackground';

// 'form' | 'queue' | 'chat' | 'feedback'
const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.2 } },
};

export default function App() {
  const { socketRef, onlineCount, isConnected, emit, on } = useSocket();
  const [appState, setAppState]     = useState('form');
  const [roomId, setRoomId]         = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [serverError, setServerError]   = useState('');
  const [queueTimeout, setQueueTimeout] = useState(false);

  // ── Socket listeners ────────────────────────────────────
  useEffect(() => {
    const offMatched  = on('matched',       ({ roomId: rid }) => { setRoomId(rid); setAppState('chat'); setQueueTimeout(false); });
    const offWaiting  = on('queue_waiting', ()               => { setAppState('queue'); setQueueTimeout(false); });
    const offTimeout  = on('queue_timeout', ()               => setQueueTimeout(true));
    const offError    = on('error',         ({ message })    => { setServerError(message); setAppState('form'); setQueueTimeout(false); });
    return () => { offMatched(); offWaiting(); offTimeout(); offError(); };
  }, [on]);

  // ── Handlers ────────────────────────────────────────────
  const handleFormComplete = (formData) => {
    setLastFormData(formData);
    setServerError('');
    setQueueTimeout(false);
    setAppState('queue');
    emit('join_queue', formData);
  };

  const handleCancelQueue = () => { emit('leave_queue'); setAppState('form'); setQueueTimeout(false); };

  // After chat → show feedback
  const handleEndChat = () => { setRoomId(null); setAppState('feedback'); };

  // "Find New Stranger" — reuse last form data
  const handleFindNew = () => {
    if (lastFormData) { setAppState('queue'); emit('join_queue', lastFormData); setQueueTimeout(false); }
    else setAppState('form');
  };

  const handleFeedbackDone = () => setAppState('form');

  return (
    <div className="app-layout">
      {/* ── Animated pixel trail bg ──────────────── */}
      <AnimatedBackground />

      {/* ── Professional Header ──────────────────────── */}
      <header className="app-header">
        <div className="app-logo">
          <ShinyText
            text="ChatWithMe"
            speed={3}
            color="#0f172a"
            shineColor="#2563eb"
            spread={100}
          />
        </div>
        <OnlineCounter count={onlineCount} isConnected={isConnected} />
      </header>

      {/* ── Main ─────────────────────────────────── */}
      <main className="app-main">
        <AnimatePresence mode="wait">

          {/* Form */}
          {appState === 'form' && (
            <motion.div key="form" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              style={{ width: '100%', maxWidth: 520 }}>
              {serverError && (
                <div style={{
                  padding: '10px 16px', marginBottom: 14,
                  background: '#fde8ea', border: '1px solid rgba(241,92,109,0.3)',
                  borderRadius: 12, color: '#c0392b', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  ⚠️ {serverError}
                </div>
              )}
              <PreferenceForm onComplete={handleFormComplete} />
            </motion.div>
          )}

          {/* Queue */}
          {appState === 'queue' && (
            <motion.div key="queue" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              style={{ width: '100%', maxWidth: 400 }}>
              <div className="card" style={{ padding: '44px 32px' }}>
                <QueueStatus onCancel={handleCancelQueue} />
                {queueTimeout && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
                    marginTop: 24, padding: '12px 16px', background: '#eff6ff',
                    border: '1px solid #dbeafe', borderRadius: 12, textAlign: 'center',
                    fontSize: '0.875rem', color: '#1e3a8a'
                  }}>
                    <p style={{ marginBottom: 12 }}>Taking too long? Try expanding your preferences.</p>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => {
                      const newForm = { ...lastFormData, preferredGender: 'any' };
                      handleFormComplete(newForm);
                    }}>
                      Match with Anyone
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Chat */}
          {appState === 'chat' && (
            <motion.div key="chat" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              style={{ width: '100%', maxWidth: 720, height: 'min(680px, calc(100dvh - 80px))' }}>
              <div className="card" style={{ height: '100%', padding: 0, overflow: 'hidden' }}>
                <ChatWindow
                  socketRef={socketRef}
                  roomId={roomId}
                  onEndChat={handleEndChat}
                  onFindNew={handleFindNew}
                />
              </div>
            </motion.div>
          )}

          {/* Feedback */}
          {appState === 'feedback' && (
            <motion.div key="feedback" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              style={{ width: '100%', maxWidth: 500 }}>
              <div className="card" style={{ overflow: 'hidden' }}>
                <FeedbackForm onDone={handleFeedbackDone} onFindNew={handleFindNew} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
