'use client';

import { useState, useRef, useEffect } from 'react';

const QUICK = [
  {
    label: 'Tell me something interesting',
    msg: 'Tell me something interesting about yourself'
  },
  {
    label: 'Thoughts on love & connection',
    msg: 'What are your thoughts on love and human connection?'
  },
  {
    label: 'How have you been lately?',
    msg: 'How has life been treating you lately?'
  },
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Session ID + load previous messages
  useEffect(() => {
    let id = localStorage.getItem('chat_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('chat_session_id', id);
    }
    setSessionId(id);

    // Load previous messages from DB
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/history?session_id=${id}`);
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          setStarted(true);
        }
      } catch (err) {
        console.error('History load failed:', err);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setStarted(true);

    const userMsg = { role: 'user', content: msg };
    const newHistory = [...messages, userMsg];

    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.slice(-12), // Sliding window — last 12 only
          session_id: sessionId,
          user_message: msg,
        }),
      });

      const data = await res.json();
      const assistantMsg = { role: 'assistant', content: data.reply };

      setMessages([...newHistory, assistantMsg]);
    } catch {
      setMessages([
        ...newHistory,
        { role: 'assistant', content: 'Something went wrong. Try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page">
      <div className="bg-blur b1" />
      <div className="bg-blur b2" />

      <div className="shell">
        <header className="header">
          <div className="header-left">
            <div className="avatar">SB</div>
            <div className="head-text">
              <h1>Shabeeh</h1>
              <p>Builder · Writer · Mountain soul</p>
            </div>
          </div>
          <div className="status">
            <span className="dot" />
            Online
          </div>
        </header>

        <main className="chat">
          {!started && (
            <div className="landing">
              <div className="big-avatar">SB</div>
              <h2>Hey, Shabeeh is here.</h2>
              <p>
                A space for thoughts, ideas, and conversations.<br />
                No pressure; just talk naturally.
              </p>
              <div className="quick">
                {QUICK.map((q) => (
                  <button key={q.label} onClick={() => sendMessage(q.msg)}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              {m.role === 'assistant' && <div className="mini-avatar">SB</div>}
              <div className={`bubble ${m.role}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="mini-avatar">SB</div>
              <div className="bubble assistant typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <footer className="footer">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              placeholder="Write something..."
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKey}
            />
            <button
              disabled={!input.trim() || loading}
              onClick={() => sendMessage()}
            >
              ➤
            </button>
          </div>
          <p className="note">Private conversation · messages saved for continuity</p>
        </footer>
      </div>

      <style jsx>{`
        .page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100dvh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #07090c;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .bg-blur {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.12;
          z-index: 1;
        }
        .b1 { width: 500px; height: 500px; background: #2a3b34; top: -100px; left: -100px; }
        .b2 { width: 400px; height: 400px; background: #0f2a20; bottom: -100px; right: -100px; }

        .shell {
          position: relative;
          width: 100%;
          max-width: 680px;
          height: 94vh;
          display: flex;
          flex-direction: column;
          background: rgba(13, 16, 21, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
          z-index: 2;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #0f131a;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }

        .header-left { display: flex; align-items: center; }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #0b0f0d;
          flex-shrink: 0;
        }

        .head-text { margin-left: 14px; }
        .head-text h1 { font-size: 16px; color: #e8efe9; margin: 0; font-weight: 600; }
        .head-text p { font-size: 12px; color: rgba(255,255,255,0.4); margin: 2px 0 0; }
        .status { font-size: 12px; color: #1fdf8f; display: flex; align-items: center; gap: 6px; }
        .dot { width: 6px; height: 6px; background: #1fdf8f; border-radius: 50%; }

        .chat {
          flex: 1;
          overflow-y: auto;
          padding: 40px 20px 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: transparent;
          -webkit-overflow-scrolling: touch;
        }

        .chat::-webkit-scrollbar { width: 4px; }
        .chat::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 2px; }

        .landing { margin: auto 0; text-align: center; width: 100%; }
        .big-avatar {
          width: 70px;
          height: 70px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 22px;
          color: #0b0f0d;
        }

        .landing h2 { color: #e8efe9; margin-bottom: 8px; font-size: 22px; }
        .landing p { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.6; }
        .quick { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
        .quick button {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 14px;
          border-radius: 14px;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          text-align: left;
          font-size: 14px;
        }

        .message-row { display: flex; width: 100%; gap: 10px; align-items: flex-end; }
        .message-row.user { justify-content: flex-end; }
        .message-row.assistant { justify-content: flex-start; }

        .mini-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1fdf8f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #0b0f0d;
          font-weight: 700;
          flex-shrink: 0;
        }

        .bubble { max-width: 78%; padding: 12px 16px; font-size: 14.5px; line-height: 1.5; word-break: break-word; }
        .bubble.assistant { background: #1b202a; border: 1px solid rgba(255,255,255,0.04); color: #e8efe9; border-radius: 18px 18px 18px 4px; }
        .bubble.user { background: linear-gradient(135deg, #1fdf8f, #0d3b2c); color: #060c09; font-weight: 500; border-radius: 18px 18px 4px 18px; }

        .typing { display: flex; gap: 5px; align-items: center; height: 20px; padding: 4px 6px; }
        .typing span { width: 6px; height: 6px; background: #1fdf8f; border-radius: 50%; animation: bounce 1s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }

        .footer { padding: 14px 16px; background: #0f131a; border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }
        .input-box { display: flex; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 22px; padding: 8px 14px; align-items: flex-end; }
        textarea { flex: 1; background: transparent; border: none; outline: none; color: #e8efe9; resize: none; font-size: 15px; line-height: 1.4; padding: 5px 0; max-height: 120px; }
        .input-box button { background: #1fdf8f; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #0b0f0d; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .input-box button:disabled { opacity: 0.2; cursor: not-allowed; }
        .note { text-align: center; font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 8px; margin-bottom: 0; }

        @media (max-width: 768px) {
          .page { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
          .shell {
            width: 100vw;
            height: 100dvh;
            max-height: 100dvh !important;
            border-radius: 0px;
            border: none;
          }
          .header { padding: 14px 16px; background: #090c10; }
          .chat { padding: 50px 14px 40px 14px; gap: 14px; }
          .bubble { max-width: 85%; font-size: 15px; }
          .footer { padding: 10px 12px calc(16px + env(safe-area-inset-bottom)); background: #090c10; }
        }
      `}</style>
    </div>
  );
}