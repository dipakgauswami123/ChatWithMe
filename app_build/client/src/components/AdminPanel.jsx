import { useState, useEffect } from 'react';
import './AdminPanel.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    fetchFeedbacks();
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/feedback`, {
        headers: { 'x-admin-password': password }
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      setFeedbacks(data.feedbacks || []);
      setError(null);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadgeClass = (rating) => {
    if (rating >= 4) return 'badge-success';
    if (rating === 3) return 'badge-warning';
    return 'badge-danger';
  };

  const getRatingLabel = (rating) => {
    const labels = { 1: 'Poor', 2: 'Fair', 3: 'Okay', 4: 'Good', 5: 'Excellent' };
    return labels[rating] || 'Unknown';
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <h1 style={{ fontSize: '1.5rem' }}>Admin Access</h1>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input"
                style={{ width: '100%' }}
                autoFocus
              />
            </div>
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              disabled={loading || !password}
            >
              {loading ? 'Verifying...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <h1>Admin Dashboard</h1>
          </div>
          <button className="btn-refresh" onClick={fetchFeedbacks} disabled={loading}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            Refresh
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{feedbacks.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {feedbacks.length > 0
                ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
                : '0.0'}
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>

        <div className="feedback-section">
          <h2 className="section-title">Recent Feedback</h2>
          
          {loading ? (
            <div className="admin-loading">Loading feedback...</div>
          ) : error ? (
            <div className="admin-error">Error: {error}</div>
          ) : feedbacks.length === 0 ? (
            <div className="admin-empty">No feedback received yet.</div>
          ) : (
            <div className="feedback-grid">
              {feedbacks.map((item) => (
                <div key={item.id} className="feedback-card">
                  <div className="feedback-card-header">
                    <div className="feedback-rating">
                      <span className={`rating-badge ${getRatingBadgeClass(item.rating)}`}>
                        {item.rating} / 5
                      </span>
                      <span className="rating-label">{getRatingLabel(item.rating)}</span>
                    </div>
                    <div className="feedback-date">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {item.selectedTags && item.selectedTags.length > 0 && (
                    <div className="feedback-tags">
                      {item.selectedTags.map(tag => (
                        <span key={tag} className="feedback-tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  {item.comment ? (
                    <div className="feedback-comment">
                      "{item.comment}"
                    </div>
                  ) : (
                    <div className="feedback-comment empty">
                      No additional comments provided.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
