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
    setLoading(true);

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
      {/* Background Glows */}
      <div className="bg-blur b1" />
      <div className="bg-blur b2" />

      <div className="shell">
        {/* FIXED HEADER */}
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

        {/* SCROLLABLE CHAT CONTAINER */}
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

        {/* STICKY FOOTER */}
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
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
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
          filter: blur(120px);
          opacity: 0.15;
          z-index: 1;
        }

        .b1 { width: 500px; height: 500px; background: #2a3b34; top: -150px; left: -120px; }
        .b2 { width: 400px; height: 400px; background: #0f2a20; bottom: -120px; right: -100px; }

        .shell {
          position: relative;
          width: 100%;
          max-width: 720px;
          height: 95vh;
          display: flex;
          flex-direction: column;
          background: rgba(12, 14, 18, 0.8);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
          z-index: 2;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(12, 14, 18, 0.4);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

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

        .head-text {
          flex: 1;
          margin-left: 12px;
        }

        .head-text h1 { font-size: 16px; color: #e8efe9; margin: 0; font-weight: 600; }
        .head-text p { font-size: 12px; color: rgba(255,255,255,0.45); margin: 2px 0 0; }

        .status { font-size: 12px; color: #1fdf8f; display: flex; align-items: center; gap: 6px; }
        .dot { width: 6px; height: 6px; background: #1fdf8f; border-radius: 50%; }

        .chat {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: transparent;
          -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
        }

        .chat::-webkit-scrollbar { width: 4px; }
        .chat::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 2px; }

        .landing {
          margin: auto 0;
          text-align: center;
          width: 100%;
          padding: 20px 0;
        }

        .big-avatar {
          width: 68px;
          height: 68px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          color: #0b0f0d;
        }

        .landing h2 { color: #e8efe9; margin-bottom: 10px; font-size: 22px; font-weight: 600; }
        .landing p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 10px; }

        .quick {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .quick button {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 14px 16px;
          border-radius: 14px;
          color: rgba(255,255,255,0.85);
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

        .row { display: flex; gap: 12px; max-width: 85%; width: max-content; }
        .row.user { margin-left: auto; flex-direction: row-reverse; max-width: 85%; width: max-content; }

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
          align-self: flex-end;
        }

        .bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }

        .bubble.assistant {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: #e8efe9;
          border-bottom-left-radius: 4px;
        }

        .bubble.user {
          background: linear-gradient(135deg, #1fdf8f, #0d3b2c);
          color: #07110d;
          font-weight: 500;
          border-bottom-right-radius: 4px;
        }

        .typing { display: flex; gap: 5px; align-items: center; height: 20px; padding: 4px 8px; }
        .typing span { width: 6px; height: 6px; background: #1fdf8f; border-radius: 50%; animation: bounce 1s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        .footer {
          padding: 16px;
          background: rgba(12, 14, 18, 0.6);
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .input-box {
          display: flex;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 8px 12px;
          align-items: flex-end;
        }

        textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e8efe9;
          resize: none;
          font-size: 15px;
          line-height: 1.4;
          padding: 6px 0;
          max-height: 120px;
        }

        .input-box button {
          background: #1fdf8f;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          color: #0b0f0d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: transform 0.1s ease, opacity 0.2s;
          flex-shrink: 0;
        }

        .input-box button:active { transform: scale(0.95); }
        .input-box button:disabled { opacity: 0.2; cursor: not-allowed; }
        .note { text-align: center; font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 8px; margin-bottom: 0; }

        /* 📱 EXTREME NATIVE MOBILE OPTIMIZATION */
        @media (max-width: 768px) {
          .page {
            position: fixed;
            width: 100%;
            height: 100%;
          }
          
          .shell {
            width: 100vw;
            height: 100%;
            max-height: 100% !important;
            border-radius: 0px;
            border: none;
          }

          .header {
            padding: 14px 16px;
            background: #0c0e12;
          }

          .chat {
            padding: 16px 16px;
            gap: 14px;
          }

          .row { max-width: 88%; }
          .row.user { max-width: 88%; }

          .bubble {
            font-size: 15px; /* iOS standard readability typography size */
            padding: 10px 14px;
          }

          .footer {
            padding: 12px 12px calc(12px + env(safe-area-inset-bottom)); /* Dynamic iPhone bar protection */
            background: #0c0e12;
          }

          .input-box {
            border-radius: 24px;
            padding: 6px 10px;
          }

          textarea {
            font-size: 15px;
          }

          .landing h2 { font-size: 20px; }
          .quick button { padding: 12px 14px; font-size: 13.5px; }
        }
      `}</style>
    </div>
  );
}