import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { env } from './env.ts';

/**
 * Embeddable support chat widget.
 *
 * Consumes the support-agent's `POST /chat` endpoint via the AI SDK
 * `useChat` hook over a `DefaultChatTransport`. The endpoint streams a UI
 * message stream (see createAgentUIStreamResponse in apps/support-agent),
 * which this hook renders incrementally.
 *
 * The backend URL is configurable (see ./env.ts) so the same build can be
 * embedded against any environment.
 */
const transport = new DefaultChatTransport({ api: `${env.supportAgentUrl}/chat` });

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({ transport });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  const busy = status === 'submitted' || status === 'streaming';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput('');
  }

  return (
    <div className="asw">
      {open && (
        <div className="asw-panel" role="dialog" aria-label="Soporte">
          <header className="asw-header">
            <span>Soporte</span>
            <button className="asw-close" onClick={() => setOpen(false)} aria-label="Cerrar">
              ×
            </button>
          </header>

          <div className="asw-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <p className="asw-empty">¿En qué puedo ayudarte hoy?</p>
            )}
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === 'text' ? p.text : ''))
                .join('');
              if (!text) return null;
              return (
                <div key={m.id} className={`asw-msg asw-msg--${m.role}`}>
                  {text}
                </div>
              );
            })}
            {status === 'submitted' && <div className="asw-msg asw-msg--assistant asw-typing">…</div>}
            {error && <div className="asw-error">Ocurrió un error. Intenta de nuevo.</div>}
          </div>

          <form className="asw-form" onSubmit={handleSubmit}>
            <input
              className="asw-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje…"
              aria-label="Mensaje"
            />
            <button className="asw-send" type="submit" disabled={busy || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        className="asw-launcher"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
