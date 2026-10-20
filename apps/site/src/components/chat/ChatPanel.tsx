import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useLocale, useT } from '@/lib/i18n';

type Msg = { role: 'user' | 'assistant'; text: string; actions?: { key: string; url: string }[] };

const BASE: string = import.meta.env.VITE_API_URL ?? '/api/v1';
const SESSION_KEY = 'isstas.chat.session';

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Lit un flux SSE (event: / data:) et appelle `on` pour chaque evenement. */
async function readStream(res: Response, on: (event: string, data: any) => void) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let i: number;
    while ((i = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, i);
      buffer = buffer.slice(i + 2);
      const event = /^event: (.+)$/m.exec(raw)?.[1] ?? 'message';
      const data = /^data: (.+)$/m.exec(raw)?.[1];
      if (data) on(event, JSON.parse(data));
    }
  }
}

export function ChatPanel({
  name,
  welcome,
  suggestions,
  whatsappUrl,
  onClose,
}: {
  name: string;
  welcome: string;
  suggestions: string[];
  whatsappUrl: string | null;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const t = useT();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [rated, setRated] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages]);
  useEffect(() => {
    field.current?.focus();
  }, []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text: message }, { role: 'assistant', text: '' }]);

    const patch = (fn: (last: Msg) => Msg) => setMessages((m) => [...m.slice(0, -1), fn(m[m.length - 1]!)]);
    try {
      const res = await fetch(`${BASE}/chat/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', 'Accept-Language': locale },
        body: JSON.stringify({ message, locale, session_id: sessionId() }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        patch((l) => ({ ...l, text: err?.error?.message ?? t('chat.error') }));
        return;
      }
      await readStream(res, (event, data) => {
        if (event === 'delta') patch((l) => ({ ...l, text: l.text + data.text }));
        else if (event === 'done') patch((l) => ({ ...l, actions: data.actions }));
        else if (event === 'error') patch((l) => ({ ...l, text: data.message }));
      });
    } catch {
      patch((l) => ({ ...l, text: t('chat.error') }));
    } finally {
      setBusy(false);
    }
  }

  async function rate(rating: 'helpful' | 'not_helpful') {
    setRated(rating);
    try {
      await fetch(`${BASE}/chat/conversations/${sessionId()}/rating`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ rating }),
      });
    } catch {
      /* sans consequence */
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <section
      role="dialog"
      aria-label={name}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="fixed inset-0 z-[60] flex flex-col bg-white shadow-lift animate-sheet-up sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[25rem] sm:rounded-2xl"
    >
      <header className="on-dark flex items-center justify-between gap-3 bg-green-500 px-5 py-4 text-white sm:rounded-t-2xl">
        <div>
          <p className="font-display text-lg font-extrabold">{name}</p>
          <p className="text-xs text-white/75">{t('chat.privacy')}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={t('chat.close')} className="grid size-10 place-items-center rounded-lg hover:bg-white/12">
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-mint-50 p-4" aria-live="polite">
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-[0.95rem] shadow-soft">{welcome}</p>
        {messages.length === 0
          ? suggestions.map((s) => (
              <button key={s} type="button" onClick={() => void send(s)} className="block max-w-[90%] rounded-full border-2 border-green-600 bg-white px-4 py-2 text-left text-sm font-semibold text-green-800 hover:bg-green-600 hover:text-white">
                {s}
              </button>
            ))
          : null}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
            <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl p-3 text-[0.95rem] ${m.role === 'user' ? 'rounded-tr-sm bg-green-600 text-white' : 'rounded-tl-sm bg-white shadow-soft'}`}>
              {m.text || (busy && i === messages.length - 1 ? <span className="inline-flex gap-1" aria-label={t('chat.typing')}><i className="size-1.5 animate-bounce rounded-full bg-green-600" /><i className="size-1.5 animate-bounce rounded-full bg-green-600 [animation-delay:120ms]" /><i className="size-1.5 animate-bounce rounded-full bg-green-600 [animation-delay:240ms]" /></span> : null)}
              {m.actions?.length ? (
                <span className="mt-3 flex flex-wrap gap-2">
                  {m.actions.map((a) => (
                    <a key={a.key} href={a.url} className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800 no-underline hover:bg-green-200">
                      {t(`chat.action.${a.key}`)}
                    </a>
                  ))}
                </span>
              ) : null}
            </div>
          </div>
        ))}
        {messages.length > 1 && !busy ? (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            {rated ? (
              <span>{t('chat.thanks')}</span>
            ) : (
              <>
                <span>{t('chat.helpful')}</span>
                <button type="button" onClick={() => void rate('helpful')} aria-label={t('chat.yes')} className="grid size-9 place-items-center rounded-full hover:bg-green-100"><ThumbsUp className="size-4" /></button>
                <button type="button" onClick={() => void rate('not_helpful')} aria-label={t('chat.no')} className="grid size-9 place-items-center rounded-full hover:bg-green-100"><ThumbsDown className="size-4" /></button>
              </>
            )}
            {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer noopener" className="ml-auto font-bold">{t('chat.human')}</a> : null}
          </div>
        ) : null}
        <div ref={end} />
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-line bg-white p-3 sm:rounded-b-2xl">
        <label htmlFor="chat-input" className="sr-only">{t('chat.placeholder')}</label>
        <textarea
          id="chat-input"
          ref={field}
          value={input}
          rows={1}
          maxLength={1000}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder={t('chat.placeholder')}
          className="field max-h-28 min-h-11 flex-1 resize-none py-2.5"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label={t('chat.send')} className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-button)] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
          <ArrowUp className="size-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}