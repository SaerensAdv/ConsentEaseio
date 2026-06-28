import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const STORAGE_KEY = "iris_chat_history_v1";
const MAX_INPUT = 1000;
const MAX_HISTORY = 20;

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm Iris — your privacy guide at ConsentEase. Ask me anything about cookies, GDPR, CCPA, or how ConsentEase works.",
};

const LINK_REGEX =
  /(^|[\s(\[])(https?:\/\/[^\s)\]]+|\/[a-z][a-z0-9/_-]*)/gi;

function renderWithLinks(text: string, baseKey: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  LINK_REGEX.lastIndex = 0;
  while ((match = LINK_REGEX.exec(text)) !== null) {
    const prefix = match[1] ?? "";
    let url = match[2] ?? "";
    const urlStart = match.index + prefix.length;
    let trailing = "";
    while (/[.,;:!?)\]]$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }
    if (!url) continue;
    if (urlStart > lastIndex) {
      parts.push(text.slice(lastIndex, urlStart));
    }
    const isExternal = /^https?:\/\//i.test(url);
    parts.push(
      <a
        key={`${baseKey}-link-${i++}`}
        href={url}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="font-medium text-primary underline underline-offset-2 hover:no-underline"
        data-testid={`link-iris-${url.replace(/[^a-z0-9]+/gi, "-")}`}
      >
        {url}
      </a>,
    );
    if (trailing) parts.push(trailing);
    lastIndex = urlStart + url.length + trailing.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m: any) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    );
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, isStreaming]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const visibleMessages: ChatMessage[] =
    messages.length === 0 ? [WELCOME_MESSAGE] : messages;

  async function send() {
    const text = input.trim();
    if (!text || isStreaming) return;
    if (text.length > MAX_INPUT) {
      setError(`Bericht is te lang (max ${MAX_INPUT} tekens).`);
      return;
    }

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg].slice(-MAX_HISTORY);
    setMessages(next);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let msg = "Something went wrong. Please try again in a moment.";
        try {
          const data = await response.json();
          if (data?.message) msg = data.message;
        } catch {
          /* ignore */
        }
        setError(msg);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setError("No response received.");
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let assistantAdded = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const line = evt
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!line) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const payload = JSON.parse(json);
            if (payload.error) {
              setError(payload.error);
              continue;
            }
            if (payload.done) continue;
            if (typeof payload.content === "string") {
              assistantText += payload.content;
              if (!assistantAdded) {
                assistantAdded = true;
                setMessages((cur) => [
                  ...cur,
                  { role: "assistant", content: assistantText },
                ]);
              } else {
                setMessages((cur) => {
                  const copy = cur.slice();
                  copy[copy.length - 1] = {
                    role: "assistant",
                    content: assistantText,
                  };
                  return copy;
                });
              }
            }
          } catch {
            /* skip malformed event */
          }
        }
      }

      if (!assistantAdded && !assistantText) {
        setError("No response received. Please try again.");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError("Connection lost. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <>
      {!open && (
        <div
          className="fixed right-5 z-50"
          style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-ping rounded-2xl bg-primary/40"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open Iris chat"
            data-testid="button-iris-open"
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/40 ring-2 ring-background transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <MessageCircle className="h-6 w-6" />
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
            </span>
          </button>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Iris chat"
          data-testid="panel-iris-chat"
          className="fixed right-5 z-50 flex w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          style={{
            bottom: "max(1.25rem, env(safe-area-inset-bottom))",
            height:
              "min(600px, calc(100dvh - max(2.5rem, env(safe-area-inset-bottom) + 1.25rem)))",
          }}
        >
          <header className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <picture>
                <source srcSet="/iris-avatar.webp" type="image/webp" />
                <img
                  src="/iris-avatar.png"
                  alt="Iris"
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-foreground/40"
                />
              </picture>
              <div className="leading-tight">
                <div className="text-sm font-semibold" data-testid="text-iris-name">
                  Iris
                </div>
                <div className="text-xs opacity-90">AI privacy guide · ConsentEase</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-md px-2 py-1 text-xs font-medium opacity-90 hover:bg-primary-foreground/15 focus:outline-none"
                  data-testid="button-iris-clear"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                data-testid="button-iris-close"
                className="rounded-md p-1 hover:bg-primary-foreground/15 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            data-testid="list-iris-messages"
          >
            {visibleMessages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${m.role}-${i}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.role === "assistant"
                    ? renderWithLinks(m.content, `msg-${i}`)
                    : m.content}
                  {isStreaming &&
                    m.role === "assistant" &&
                    i === visibleMessages.length - 1 && (
                      <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-current align-middle" />
                    )}
                </div>
              </div>
            ))}
            {isStreaming &&
              visibleMessages[visibleMessages.length - 1]?.role === "user" && (
                <div className="flex justify-start" data-testid="status-iris-thinking">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Spinner variant="brand" className="h-4 w-4" />
                    Iris is thinking…
                  </div>
                </div>
              )}
            {error && (
              <div
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                data-testid="text-iris-error"
              >
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-background px-3 pt-2 pb-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                onKeyDown={handleKeyDown}
                placeholder="Ask Iris a question…"
                rows={1}
                maxLength={MAX_INPUT}
                disabled={isStreaming}
                data-testid="input-iris-message"
                className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => void send()}
                disabled={isStreaming || input.trim().length === 0}
                data-testid="button-iris-send"
                aria-label="Send message"
              >
                {isStreaming ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-[10px] leading-tight text-muted-foreground">
              Messages are processed by OpenAI to generate replies.
              Iris provides general information, not binding legal advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
