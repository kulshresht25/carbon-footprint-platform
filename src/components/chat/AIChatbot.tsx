"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { mockChatResponses } from "@/lib/mockData";
import app from "@/lib/firebase";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
  systemInstruction: "You are Eco AI Coach, a friendly, supportive, and knowledgeable AI sustainability coach. You help users reduce their carbon footprint, adopt eco-friendly habits, and complete green challenges. Keep responses concise, practical, and positive. Use emojis to make formatting clear. Always speak from the perspective of an expert in climate action and green living."
});

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
  time: string;
}

const suggestions = [
  "How do I reduce emissions?",
  "Is cycling better than metro?",
  "How much CO₂ does a flight emit?",
  "Best eco-friendly habits?",
  "Tips for sustainable shopping?",
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("emission") || lower.includes("reduce") || lower.includes("habits"))
    return mockChatResponses.emissions;
  if (lower.includes("cycl") || lower.includes("metro") || lower.includes("transport"))
    return mockChatResponses.cycling;
  if (lower.includes("flight") || lower.includes("plane") || lower.includes("fly"))
    return mockChatResponses.flight;
  if (lower.includes("shop") || lower.includes("buy") || lower.includes("purchas"))
    return mockChatResponses.shopping;
  return mockChatResponses.default;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "bot",
    content:
      "👋 Hi! I'm your AI Sustainability Coach. Ask me anything about reducing your carbon footprint, eco habits, or climate action!",
    time: "now",
  },
];
const createMessage = (role: "user" | "bot", content: string): Message => {
  return {
    id: role === "user" ? Date.now() : Date.now() + 1,
    role,
    content,
    time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
  };
};

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    // Initialize the chat session when the component mounts
    chatRef.current = model.startChat();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = createMessage("user", text);
    // eslint-disable-next-line react-hooks/purity
    const botMsgId = Date.now() + 1;
    const botMsgPlaceholder: Message = {
      id: botMsgId,
      role: "bot",
      content: "",
      time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, botMsgPlaceholder]);
    setInput("");
    setTyping(true);

    try {
      if (!chatRef.current) {
        chatRef.current = model.startChat();
      }

      const result = await chatRef.current.sendMessageStream(text);
      setTyping(false);

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to generate content from Gemini:", error);
      setTyping(false);
      const fallbackText = getResponse(text);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId ? { ...msg, content: fallbackText } : msg
        )
      );
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setOpen(!open);
          setHasUnread(false);
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-shadow"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {!open && hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">1</span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 left-4 sm:right-6 sm:left-auto z-50 w-auto sm:w-96 flex flex-col glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-600/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm flex items-center gap-1">
                  Eco AI Coach
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "bot"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-violet-500 to-purple-600"
                    }`}
                  >
                    {msg.role === "bot" ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "bot"
                          ? "bg-slate-800 text-slate-200 rounded-tl-sm"
                          : "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-tr-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-slate-600 text-xs">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-green-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 border-t border-white/5">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask about eco tips..."
                  className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 disabled:opacity-40 hover:scale-105 transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
