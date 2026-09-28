// ChatWindow.jsx — Professional real-time chat UI

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TYPING_DEBOUNCE_MS = 1200;

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ socketRef, roomId, onEndChat, onFindNew }) {
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerGone, setPartnerGone]     = useState(false);
  const messagesEndRef                    = useRef(null);
  const typingTimerRef                    = useRef(null);
  const isTypingRef                       = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onMessage      = ({ text, timestamp }) => setMessages(p => [...p, { text, timestamp, isOwn: false }]);
    const onTyping       = ({ isTyping }) => setPartnerTyping(isTyping);
    const onDisconnected = () => {
      setPartnerGone(true);
      setPartnerTyping(false);
      setMessages(p => [...p, { text: 'Stranger has disconnected.', isSystem: true, timestamp: Date.now() }]);
    };

    socket.on('chat_message',        onMessage);
    socket.on('partner_typing',      onTyping);
    socket.on('partner_disconnected',onDisconnected);
    return () => {
      socket.off('chat_message',        onMessage);
      socket.off('partner_typing',      onTyping);
      socket.off('partner_disconnected',onDisconnected);
    };
  }, [socketRef]);

  const emitTypingStop = useCallback(() => {
    if (isTypingRef.current) {
      socketRef.current?.emit('typing_stop', { roomId });
      isTypingRef.current = false;
    }
  }, [socketRef, roomId]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isTypingRef.current && e.target.value.trim()) {
      socketRef.current?.emit('typing_start', { roomId });
      isTypingRef.current = true;
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(emitTypingStop, TYPING_DEBOUNCE_MS);
    if (!e.target.value.trim()) emitTypingStop();
  };

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || partnerGone) return;
    socketRef.current?.emit('chat_message', { roomId, text });
    setMessages(p => [...p, { text, timestamp: Date.now(), isOwn: true }]);
    setInput('');
    emitTypingStop();
    clearTimeout(typingTimerRef.current);
  }, [input, roomId, socketRef, partnerGone, emitTypingStop]);

  const handleEndChat = () => { socketRef.current?.emit('end_chat'); onEndChat(); };

  return (
    <div id="chat-window" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}>

      {/* ── Professional Header ──────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', color: '#2563eb'
          }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>Stranger</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: partnerGone ? '#94a3b8' : '#16a34a' }}>
              {partnerGone ? '● Disconnected' : '● Online'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {partnerGone && (
            <button id="find-new-btn" onClick={onFindNew} style={{
              padding: '7px 14px', fontSize: '0.8125rem', fontWeight: 600,
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 999, cursor: 'pointer',
            }}>New Chat</button>
          )}
          <button id="end-chat-btn" onClick={handleEndChat} style={{
            padding: '7px 14px', fontSize: '0.8125rem', fontWeight: 600,
            background: '#f1f5f9', color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: 999, cursor: 'pointer',
          }}>End Chat</button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────── */}
      <div id="messages-list" style={{
        flex: 1, overflowY: 'auto', padding: '20px 16px 10px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        background: '#f8fafc',
      }}>
        {/* Privacy notice */}
        <div style={{
          textAlign: 'center', marginBottom: 12, alignSelf: 'center',
          fontSize: '0.75rem', color: '#64748b',
          padding: '6px 14px',
          background: '#f1f5f9',
          borderRadius: 8,
        }}>
          Messages are end-to-end anonymous. No logs kept.
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              id={`msg-${i}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                justifyContent: msg.isSystem ? 'center' : msg.isOwn ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.isSystem ? (
                <span style={{
                  fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic',
                  padding: '6px 12px', background: '#f1f5f9',
                  borderRadius: 8, marginTop: 4, marginBottom: 4,
                }}>{msg.text}</span>
              ) : (
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: msg.isOwn ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.isOwn ? '#2563eb' : '#ffffff',
                    color: msg.isOwn ? '#ffffff' : '#0f172a',
                    border: msg.isOwn ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
                  }}>{msg.text}</div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', padding: '0 4px' }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {partnerTyping && (
            <motion.div key="typing"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <div style={{
                padding: '10px 16px', background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px 16px 16px 4px',
                display: 'flex', gap: 4, alignItems: 'center',
                boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', display: 'block' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>typing…</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* ── Professional Input Bar ───────────────────────── */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', gap: 12, flexShrink: 0, alignItems: 'center',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
      }}>
        <input
          id="message-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={partnerGone ? 'Chat ended' : 'Type a message'}
          disabled={partnerGone}
          autoComplete="off"
          maxLength={2000}
          style={{
            flex: 1, padding: '12px 18px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 999,
            fontSize: '0.9375rem',
            color: '#0f172a',
            outline: 'none',
          }}
        />
        <button
          id="send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || partnerGone}
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: input.trim() && !partnerGone ? '#2563eb' : '#e2e8f0',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: input.trim() && !partnerGone ? '#ffffff' : '#94a3b8',
            transition: 'background 0.2s',
          }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );
}
