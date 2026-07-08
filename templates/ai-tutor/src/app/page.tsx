'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // === Reset percakapan ===
  async function resetChat() {
    setMessages([]);
    setConversationId(null);
  }

  return (
    <main className="max-w-3xl mx-auto p-4 min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold text-indigo-400">
          🤖 RPL AI Tutor
        </h1>
        <p className="text-gray-400 mt-1">
          Teman belajar AI untuk siswa SMK RPL
        </p>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-5xl mb-4">👋</p>
            <p>Tanyakan apapun tentang RPL AI!</p>
            <p className="text-sm mt-2">
              Contoh: &quot;Apa itu REST API?&quot; atau &quot;Jelaskan neural
              network&quot;
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-700 text-gray-100 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="animate-pulse text-gray-300">Mengetik...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya sesuatu..."
          rows={1}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors"
        >
          {loading ? '⏳' : '➤'}
        </button>
        {messages.length > 0 && (
          <button
            onClick={resetChat}
            className="text-gray-500 hover:text-red-400 px-3 py-3 text-sm transition-colors"
            title="Reset percakapan"
          >
            ↺
          </button>
        )}
      </div>
    </main>
  );
}
