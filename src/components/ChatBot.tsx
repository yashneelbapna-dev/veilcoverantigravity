import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, ChevronDown, Send, Copy, Check, Trash2, ArrowDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface QuickReply {
  label: string;
  message: string;
}

const quickReplies: QuickReply[] = [
  { label: "🛍️ Shop Cases", message: "Show me all available cases" },
  { label: "📦 Track Order", message: "Where is my order?" },
  { label: "🏷️ View Offers", message: "Do I have any coupon codes?" },
  { label: "↩️ Returns", message: "What is your return policy?" },
  { label: "📱 Find My Case", message: "Help me find a case for my phone" },
  { label: "⭐ Best Sellers", message: "What are your best selling cases?" },
];

// ── Rich content parsers ─────────────────

function CouponBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span
      className="inline-flex items-center gap-2 my-1 px-3 py-1.5 rounded-lg border border-[#C9A96E]/30 bg-[#C9A96E]/10 font-mono text-[13px] text-[#C9A96E] cursor-pointer hover:bg-[#C9A96E]/20 transition-colors"
      onClick={copy}
    >
      {code}
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </span>
  );
}

function parseContent(text: string, navigate: (path: string) => void, closeChat: () => void) {
  const parts: (string | JSX.Element)[] = [];
  const linkRegex = /\/product\/[\w-]+/g;
  const couponRegex = /\b([A-Z][A-Z0-9]{3,14})\b/g;

  let lastIndex = 0;
  const matches: { index: number; length: number; type: "link" | "coupon"; value: string }[] = [];

  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(text)) !== null) {
    matches.push({ index: m.index, length: m[0].length, type: "link", value: m[0] });
  }
  while ((m = couponRegex.exec(text)) !== null) {
    const skip = ["VEIL", "COD", "RLS", "UUID", "JSON", "API", "URL", "NEW", "BEST", "SOLD", "OUT", "FREE"];
    if (!skip.includes(m[1]) && m[1].length >= 4) {
      matches.push({ index: m.index, length: m[0].length, type: "coupon", value: m[1] });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const filtered: typeof matches = [];
  for (const match of matches) {
    const last = filtered[filtered.length - 1];
    if (last && match.index < last.index + last.length) continue;
    filtered.push(match);
  }

  for (const match of filtered) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match.type === "link") {
      parts.push(
        <button
          key={`link-${match.index}`}
          className="text-[#C9A96E] underline underline-offset-2 hover:text-[#D4B07A] transition-colors"
          onClick={() => { navigate(match.value); closeChat(); }}
        >
          {match.value}
        </button>
      );
    } else {
      parts.push(<CouponBlock key={`coupon-${match.index}`} code={match.value} />);
    }
    lastIndex = match.index + match.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// ── Typing indicator ─────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "600ms" }}
        />
      ))}
    </div>
  );
}

// ── Streaming cursor ─────────────────────

function StreamingCursor() {
  return (
    <span className="inline-block w-[2px] h-[14px] bg-[#C9A96E] ml-0.5 animate-pulse" />
  );
}

// ── Main ChatBot component ───────────────

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/veil-chat`;

const ChatBot = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(() => sessionStorage.getItem("veil-chat-open") === "true");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(() => sessionStorage.getItem("veil-chat-opened") === "true");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isStreaming, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!atBottom);
  };

  useEffect(() => {
    sessionStorage.setItem("veil-chat-open", String(isOpen));
  }, [isOpen]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasOpenedOnce) {
      setHasOpenedOnce(true);
      sessionStorage.setItem("veil-chat-opened", "true");
      const timer = setTimeout(() => {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "bot",
            content: "Hey there! 👋 I'm the VEIL Assistant. I can help you find the perfect case, track your orders, or answer any questions about our products. What can I do for you today?",
            timestamp: new Date(),
          },
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length, hasOpenedOnce]);

  const closeChat = () => setIsOpen(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowQuickReplies(false);

    // Create placeholder bot message for streaming
    const botMsgId = crypto.randomUUID();

    // Show typing dots briefly before stream starts
    setIsTyping(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abort.signal,
      });

      if (!resp.ok) {
        let errorDetail = `Status: ${resp.status}`;
        try {
          const data = await resp.json();
          errorDetail += ` - ${data.reply || data.error || JSON.stringify(data)}`;
          if (resp.status === 429) throw new Error("Rate limit exceeded");
          if (resp.status === 402) throw new Error("Payment required");
          throw new Error(data.reply || "Connection error");
        } catch (e: any) {
          if (e.message && e.message !== "Connection error") throw e;
          throw new Error(`Failed to connect (${errorDetail})`);
        }
      }

      if (!resp.body) {
        throw new Error("No response body received");
      }

      const contentType = resp.headers.get("content-type") || "";

      // Handle non-streaming JSON response (error fallback)
      if (contentType.includes("application/json")) {
        const data = await resp.json();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            role: "bot",
            content: data.reply || "Sorry, something went wrong.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // ── Stream SSE response token-by-token ──
      setIsTyping(false);
      setIsStreaming(true);

      // Add empty bot message to fill progressively
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, role: "bot", content: "", timestamp: new Date() },
      ]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              // Update the last bot message with new content
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].id === botMsgId) {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + content,
                  };
                }
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].id === botMsgId) {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + content,
                  };
                }
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!isOpen) setHasNewMessage(true);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("ChatBot error:", err?.message || err, err);
      setIsTyping(false);
      
      // Remove empty bot message if streaming failed partway
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.id === botMsgId && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
      
      const errorMsg = err?.message?.includes("Rate limit") 
        ? "I'm getting too many requests right now. Please wait a moment and try again."
        : err?.message?.includes("Payment")
        ? "The AI service is temporarily unavailable. Please try again later."
        : "Sorry, something went wrong. Please try again!";
      
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: errorMsg,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    if (window.confirm("Start a new conversation? This will clear chat history.")) {
      abortRef.current?.abort();
      setMessages([]);
      setShowQuickReplies(true);
      setHasOpenedOnce(false);
      sessionStorage.removeItem("veil-chat-opened");
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <>
      {/* ── Trigger Button with WhatsApp ring ── */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col items-center gap-0.5 md:gap-1">
        <div
          className="rounded-full p-[2px] md:p-[3px]"
          style={{ border: "1.5px solid #25D366" }}
        >
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) setHasNewMessage(false);
            }}
            className="w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 relative"
            style={{
              background: "#C9A96E",
              boxShadow: "0 8px 32px rgba(201,169,110,0.3)",
              animation: !hasOpenedOnce ? "pulse-ring 2s ease-out infinite" : undefined,
            }}
            aria-label="Open chat"
          >
            {isOpen ? (
              <X className="h-5 w-5 md:h-6 md:w-6 text-black" />
            ) : (
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-black" />
            )}
            {!isOpen && hasNewMessage && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-black" />
            )}
          </button>
        </div>
        {!isOpen && (
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="8" height="8" className="md:w-[10px] md:h-[10px]" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[9px] md:text-[10px] font-medium" style={{ color: "#25D366" }}>Order via WhatsApp</span>
          </div>
        )}
      </div>

      {/* ── Chat Window ─────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed z-[9998] flex flex-col bottom-[76px] md:bottom-[92px] right-4 md:right-6 w-[380px] h-[560px] max-md:w-screen max-md:h-[100dvh] max-md:bottom-0 max-md:right-0 max-md:rounded-none rounded-2xl overflow-hidden"
            style={{
              background: "#111111",
              border: "1px solid #1F1F1F",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 shrink-0"
              style={{ height: 64, background: "#0A0A0A", borderBottom: "1px solid #1F1F1F" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: "#C9A96E" }}>
                  V
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">VEIL Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[11px] text-white/40">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={clearChat} className="p-2 text-white/30 hover:text-white transition-colors" title="Clear chat">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 text-white/30 hover:text-white transition-colors md:hidden">
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-white/30 hover:text-white transition-colors hidden md:block">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 chat-scrollbar"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-[16px_16px_4px_16px] text-black font-medium"
                        : "rounded-[4px_16px_16px_16px] text-white border border-[#2A2A2A]"
                    }`}
                    style={{
                      background: msg.role === "user" ? "#C9A96E" : "#1A1A1A",
                    }}
                  >
                    {msg.role === "bot"
                      ? <>
                          {parseContent(msg.content, navigate, closeChat)}
                          {isStreaming && messages[messages.length - 1]?.id === msg.id && <StreamingCursor />}
                        </>
                      : msg.content}
                  </div>
                  <span className="text-[10px] text-[#555] mt-1 px-1">{formatTime(msg.timestamp)}</span>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="rounded-[4px_16px_16px_16px] border border-[#2A2A2A]" style={{ background: "#1A1A1A" }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {showQuickReplies && messages.length <= 1 && !isTyping && !isStreaming && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => sendMessage(qr.message)}
                      className="px-3.5 py-2 text-xs rounded-full border transition-all duration-150 hover:border-[#C9A96E] hover:text-white hover:bg-[#C9A96E]/10"
                      style={{ background: "#1A1A1A", borderColor: "#2A2A2A", color: "#CCC" }}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Order via WhatsApp */}
              <div className="mt-3 px-1">
                <a
                  href="https://api.whatsapp.com/send?phone=918850849834&text=Hi%20VEIL%2C%20I%27m%20interested%20in%20placing%20an%20order.%20Can%20you%20help%20me%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:opacity-90 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Order via WhatsApp
                </a>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-[76px] left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all"
                style={{ background: "#C9A96E", color: "#000" }}
              >
                <ArrowDown className="h-3 w-3" /> New message
              </button>
            )}

            {/* Input */}
            <div
              className="flex items-end gap-2 px-4 py-3 shrink-0"
              style={{ background: "#0A0A0A", borderTop: "1px solid #1F1F1F" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 resize-none rounded-3xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  maxHeight: 100,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A96E")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping || isStreaming}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-150"
                style={{
                  background: input.trim() && !isTyping && !isStreaming ? "#C9A96E" : "#2A2A2A",
                }}
              >
                <Send className="h-[18px] w-[18px]" style={{ color: input.trim() && !isTyping && !isStreaming ? "#000" : "#555" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(201,169,110,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(201,169,110,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,169,110,0); }
        }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: #1A1A1A; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>
    </>
  );
};

export default ChatBot;
