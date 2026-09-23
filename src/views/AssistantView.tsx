import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Info,
  HelpCircle
} from 'lucide-react';
import { useEarnWise } from '../context/EarnWiseContext';

export const AssistantView: React.FC = () => {
  const { chatMessages, sendAssistantMessage, userName } = useEarnWise();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const defaultChips = [
    "How much can I safely spend this week?",
    "Why did you save ₹150 today?",
    "How much tax have I reserved?",
    "What is my emergency fund status?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendAssistantMessage(text);
    setInputText('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>EarnWise Assistant</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial AI Copilot</h1>
          <p className="text-xs text-slate-400">
            Grounded in your live financial state: questions on cash flow, safe spending, and auto-save rationale
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Grounded State Engine</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col h-[520px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
                <span className="text-[10px] opacity-60 mt-1 block font-mono">
                  {msg.timestamp}
                </span>

                {/* Chips for quick questions if provided */}
                {msg.chips && msg.sender === 'assistant' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.chips.map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Questions Row */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Demo Prompts:</span>
          {defaultChips.map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 transition-colors border border-slate-700 flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about your safe spending, today's saving, or taxes..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50"
              disabled={!inputText.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
