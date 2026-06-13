import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your SENTARA Virtual Assistant. Ask me anything about our products, delivery, or group shopping features! ⚡",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const presets = [
    { label: "📦 Track Delivery", query: "How long does delivery take?" },
    { label: "🎓 Student Mode", query: "What student discounts do you have?" },
    { label: "💳 Refund Policy", query: "What is your replacement policy?" },
    { label: "🏆 Shopping Score", query: "How do I earn SENTARA Points?" }
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    try {
      const res = await api.chat.send(textToSend);
      if (res.success) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Sorry, I am currently unavailable.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 h-[480px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-slate-800 dark:to-slate-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Sparkles size={16} className="text-yellow-300" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black tracking-wide uppercase">AI Shopping Assistant</h4>
                  <span className="text-[9px] text-blue-100 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" /> Online & Active
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed text-left ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50 shadow-sm'
                    }`}
                  >
                    <p className="font-semibold">{msg.text}</p>
                    <span className="block text-[8px] text-right mt-1 opacity-60">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Preset Options */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 text-left">Quick Topics</span>
                <div className="flex gap-1.5 flex-wrap">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.query)}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200/35 dark:border-slate-700/35 transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask me a question..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-white dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2 rounded-xl transition-all shadow-md flex items-center justify-center flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-primary text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group border border-white/10"
        aria-label="Toggle AI Assistant"
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              <MessageSquare size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
