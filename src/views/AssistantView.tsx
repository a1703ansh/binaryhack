import React, { useState, useRef, useEffect } from 'react';
import { useEarnWise } from '../context/EarnWiseContext';
import { MaterialIcon } from '../components/ui';

/* =========================================================
   Financial AI Copilot — "Flat Mascot Playful" restyle.
   Sending, chips and scroll behaviour are unchanged.
   ========================================================= */

export const AssistantView: React.FC = () => {
  const { chatMessages, sendAssistantMessage } = useEarnWise();
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
          <div className="flex items-center gap-2 font-ui text-[11px] font-semibold text-ocean uppercase tracking-wider mb-1">
            <MaterialIcon name="smart_toy" className="text-base" filled />
            <span>EarnWise assistant</span>
          </div>
          <h1 className="font-questrial text-3xl text-surface lowercase tracking-tight">financial copilot</h1>
          <p className="font-questrial text-sm text-surface/95 max-w-xl">
            grounded in your live financial state — cash flow, safe spending and auto-save rationale
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-secondary-deep font-ui text-[11px] font-semibold shadow-[0_3px_0_0_#d8c3ad] self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>Grounded state engine</span>
        </div>
      </div>

      {/* Chat container */}
      <div className="bg-surface rounded-card shadow-[0_6px_0_0_#006686] flex flex-col h-[520px] overflow-hidden">
        {/* Messages feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {chatMessages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-ocean text-white shadow-[0_3px_0_0_#006686]'
                      : 'bg-primary text-primary-on shadow-[0_3px_0_0_#ad3300]'
                  }`}
                  aria-hidden="true"
                >
                  <MaterialIcon name={isUser ? 'person' : 'smart_toy'} className="text-lg" filled={!isUser} />
                </div>

                <div
                  className={`max-w-[80%] rounded-card p-4 font-questrial text-sm leading-relaxed ${
                    isUser
                      ? 'bg-ocean text-white rounded-tr-md'
                      : 'bg-surface-container text-ink rounded-tl-md'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`font-currency text-[10px] mt-1 block ${isUser ? 'text-white/70' : 'text-ink-subtle'}`}>
                    {msg.timestamp}
                  </span>

                  {/* Follow-up chips */}
                  {msg.chips && msg.sender === 'assistant' && (
                    <div className="mt-3 pt-3 border-t border-bevel-neutral flex flex-wrap gap-1.5">
                      {msg.chips.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold bg-surface text-primary-deep shadow-[0_2px_0_0_#d8c3ad] hover:brightness-105 cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Demo prompts */}
        <div className="p-3 bg-surface-low border-t border-bevel-neutral flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <MaterialIcon name="auto_awesome" className="text-base text-primary-deep shrink-0" />
          <span className="font-ui text-[11px] text-ink-subtle font-semibold mr-1">Demo prompts:</span>
          {defaultChips.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              className="font-ui text-[11px] px-2.5 py-1 rounded-full bg-surface text-ink-muted border-2 border-bevel-neutral hover:bg-surface-high transition-colors shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-4 bg-surface-low border-t border-bevel-neutral">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask the EarnWise copilot
            </label>
            <input
              id="assistant-input"
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about your safe spending, today's saving, or taxes…"
              className="flex-1 px-4 py-2.5 rounded-input bg-surface border-2 border-bevel-neutral font-ui text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-full bg-primary text-primary-on shadow-[0_4px_0_0_#ad3300] hover:brightness-105 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              <MaterialIcon name="send" className="text-lg" filled />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
