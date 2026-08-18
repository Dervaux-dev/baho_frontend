import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function AiChat({ budgets }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Muraho! I am your Baho AI assistant. Ask me anything about your budget, spending, or market prices. I respond in Kinyarwanda and English.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [mode, setMode] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (mode === 'budget' && selectedBudget) {
        const res = await axios.post(`${API}/ai/budget-advice`, {
          budgetId: selectedBudget,
          question: text,
        });
        if (res.data.success) {
          setMessages((prev) => [...prev, { role: 'assistant', content: res.data.data.reply }]);
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process that request.' }]);
        }
      } else {
        const res = await axios.post(`${API}/ai/chat`, { message: text });
        if (res.data.success) {
          setMessages((prev) => [...prev, { role: 'assistant', content: res.data.data.reply }]);
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: res.data.error || 'Sorry, something went wrong.' }]);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Connection failed';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'Niba nfite amafaranga 50000, ndabishyrahe?',
    'Iki gihe ni cyo kiza kugura amata?',
    'Reka nibaresha amafaranga yanjye',
    'What are my top spending categories?',
  ];

  return (
    <div className="db-ai-chat">
      <div className="db-section-header">
        <p className="db-section-desc">Chat with AI assistant powered by EjoChat (Kinyarwanda-first AI).</p>
        <div className="db-form-group" style={{ marginBottom: 0 }}>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="chat">General Chat</option>
            <option value="budget">Budget Context</option>
          </select>
        </div>
      </div>

      {mode === 'budget' && (
        <div className="db-form-group" style={{ marginBottom: 12 }}>
          <label>Select Budget for Context</label>
          <select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)}>
            <option value="">Choose a budget...</option>
            {budgets.map((b) => (
              <option key={b._id} value={b._id}>{b.name} (RWF {b.totalBudget?.toLocaleString()})</option>
            ))}
          </select>
        </div>
      )}

      <div className="db-card" style={{ display: 'flex', flexDirection: 'column', height: 480 }}>
        <div className="db-chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`db-chat-msg db-chat-msg-${msg.role}`}>
              <div className="db-chat-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="db-chat-msg db-chat-msg-assistant">
              <div className="db-chat-bubble db-chat-typing">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Quick questions:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  className="db-btn db-btn-sm db-btn-secondary"
                  onClick={() => setInput(q)}
                  style={{ fontSize: 12 }}
                >
                  {q.length > 40 ? q.slice(0, 40) + '...' : q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'budget' ? 'Ask about your budget in Kinyarwanda or English...' : 'Type a message...'}
            rows={1}
            style={{ flex: 1, resize: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit' }}
          />
          <button className="db-btn db-btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
