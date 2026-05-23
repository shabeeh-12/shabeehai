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

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
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
    setLoading(true); // <-- FIX: Yahan capital L tha, ab theek kar diya hai

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await res.json();

      setMessages([
        ...newHistory,
        { role: 'assistant', content: data.reply }
      ]);
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
        {/* HEADER */}
        <header className="header">
          <div className="avatar">SB</div>

          <div className="head-text">
            <h1>Shabeeh</h1>
            <p>Builder · Writer · Mountain soul</p>
          </div>

          <div className="status">
            <span className="dot" />
            Online
          </div>
        </header>

        {/* CHAT */}
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
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.msg)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`row ${m.role}`}>
              {m.role === 'assistant' && <div className="mini-avatar">SB</div>}
              <div className={`bubble ${m.role}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="row assistant">
              <div className="mini-avatar">SB</div>
              <div className="bubble assistant typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        {/* INPUT */}
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
          <p className="note">Private conversation · no data stored</p>
        </footer>
      </div>

      <style jsx>{`
        .page {
          height: 100vh;
          height: -webkit-fill-available; /* Mobile safari/chrome viewports fix */
          display: flex;
          justify-content: center;
          align-items: center;
          background: #07090c;
          overflow: hidden;
          position: relative;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .bg-blur {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.25;
        }

        .b1 {
          width: 500px;
          height: 500px;
          background: #2a3b34;
          top: -150px;
          left: -120px;
        }

        .b2 {
          width: 400px;
          height: 400px;
          background: #0f2a20;
          bottom: -120px;
          right: -100px;
        }

        .shell {
          width: 100%;
          max-width: 720px;
          height: 100%; /* Pure screen size matching */
          max-height: 96vh;
          display: flex;
          flex-direction: column;
          background: rgba(12, 14, 18, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
          transition: all 0.3s ease;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #0b0f0d;
        }

        .head-text {
          flex: 1;
          margin-left: 12px;
        }

        .head-text h1 {
          font-size: 16px;
          color: #e8efe9;
          margin: 0;
        }

        .head-text p {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin: 2px 0 0;
        }

        .status {
          font-size: 11px;
          color: #1fdf8f;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #1fdf8f;
          border-radius: 50%;
        }

        .chat {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat::-webkit-scrollbar {
          width: 6px;
        }
        .chat::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .landing {
          margin: auto;
          text-align: center;
          width: 100%;
          max-width: 400px;
          padding: 20px 0;
        }

        .big-avatar {
          width: 60px;
          height: 60px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #0b0f0d;
        }

        .landing h2 {
          color: #e8efe9;
          margin-bottom: 8px;
          font-size: 22px;
        }

        .landing p {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
        }

        .quick {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .quick button {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 14px 16px;
          border-radius: 14px;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          width: 100%;
          font-size: 14px;
        }

        .quick button:hover {
          border-color: rgba(31,223,143,0.3);
          background: rgba(31,223,143,0.04);
          color: #1fdf8f;
        }

        .row {
          display: flex;
          gap: 10px;
          max-width: 85%;
        }

        .row.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .mini-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #1fdf8f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #0b0f0d;
          font-weight: 600;
          flex-shrink: 0;
        }

        .bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
        }

        .bubble.assistant {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: #e8efe9;
        }

        .bubble.user {
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          color: #07110d;
          font-weight: 500;
        }

        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
          height: 30px;
        }

        .typing span {
          width: 6px;
          height: 6px;
          background: #1fdf8f;
          border-radius: 50%;
          animation: bounce 1s infinite;
        }

        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        .footer {
          padding: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .input-box {
          display: flex;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          padding: 10px;
          align-items: flex-end;
        }

        textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e8efe9;
          resize: none;
          font-size: 14px;
          line-height: 1.4;
          padding: 4px 0;
          max-height: 140px;
        }

        .input-box button {
          background: #1fdf8f;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          cursor: pointer;
          color: #0b0f0d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .input-box button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .note {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
        }

        /* 📱 MOBILE RESPONSIVE MEDIA QUERIES */
        @media (max-width: 768px) {
          .shell {
            height: 100%;
            max-height: 100vh;
            border-radius: 0px;
            border: none;
          }
          
          .chat {
            padding: 16px 14px;
            gap: 10px;
          }

          .row {
            max-width: 90%;
          }

          .bubble {
            font-size: 14px;
            padding: 10px 12px;
          }

          .landing h2 {
            font-size: 20px;
          }

          .quick button {
            padding: 12px 14px;
            font-size: 13px;
          }
          
          .footer {
            padding: 10px 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}