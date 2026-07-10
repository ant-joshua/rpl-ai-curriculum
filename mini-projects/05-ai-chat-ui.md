# 🤖 05. AI Chat UI

> **Level:** 🌱 Beginner | **Estimasi:** 1-2 sesi | **Modul Terkait:** 01-JS Dasar, 03-Web Dasar, 07-Mastra

---

## 🎯 Tujuan

Membangun antarmuka (UI) chat untuk AI chatbot — lengkap dengan message bubbles, animasi typing, riwayat percakapan, dan koneksi opsional ke API AI seperti OpenRouter. Projek ini fokus pada:

- **UI Component Design**: Chat container, message bubbles (user vs AI), input bar, scroll management
- **Asynchronous Rendering**: Streaming text effect — menampilkan teks AI karakter per karakter seolah-olah AI sedang mengetik
- **State Management**: Menyimpan riwayat chat, membedakan pesan user dan AI
- **API Integration (Opsional)**: Fetch ke OpenRouter API / Mastra agent untuk respons AI nyata
- **Event Handling**: Submit via tombol, Enter key, auto-scroll ke pesan terbaru
- **CSS Art**: Bubble styling, gradient backgrounds, avatar, timestamp

Projek ini adalah wajah depan (frontend) dari AI agent — tanpanya, agent cuma API endpoint yang sepi. Setelah ini, kamu bisa menghubungkan UI ini ke agent Mastra atau API LLM manapun.

---

## 🛠 Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| **HTML5** | Semantic structure, template literals |
| **CSS3** | Flexbox, custom properties, animasi, gradients |
| **Vanilla JS** | DOM manipulation, Fetch API, async/await, EventSource |
| **Marked CDN** | Render Markdown dalam respons AI |
| **Highlight.js CDN** | Syntax highlighting dalam code block |
| **OpenRouter API** (opsional) | Proxy ke berbagai LLM (GPT, Claude, Llama, DeepSeek) |

> **Zero framework** untuk UI — semua murni HTML/CSS/JS. API integration adalah satu-satunya bagian yang optional.

---

## 📋 Requirements

### Fungsional

| # | Fitur | Wajib / Bonus |
|---|-------|---------------|
| 1 | Chat container dengan scroll | Wajib |
| 2 | Message bubbles: user (kanan, biru) vs AI (kiri, abu-abu) | Wajib |
| 3 | Input bar + tombol send | Wajib |
| 4 | Submit via Enter key + tombol klik | Wajib |
| 5 | Auto-scroll ke pesan terbaru | Wajib |
| 6 | Typing indicator ("AI sedang mengetik...") | Wajib |
| 7 | Streaming text effect (tampil karakter per karakter) | Wajib |
| 8 | Timestamp per pesan | Wajib |
| 9 | Avatar untuk user dan AI | Wajib |
| 10 | Tombol clear/hapus percakapan | Wajib |
| 11 | Markdown render dalam pesan AI (bold, list, code block) | Wajib |
| 12 | Syntax highlighting di code block | Bonus |
| 13 | Dark mode toggle | Bonus |
| 14 | Copy code button | Bonus |
| 15 | Koneksi ke OpenRouter API (respons AI nyata) | Bonus |
| 16 | Streaming response (SSE / fetch chunk) | Bonus |
| 17 | Voice input (Web Speech API) | Bonus |
| 18 | Pesan contoh (suggestions chip) saat first load | Bonus |

### Non-Fungsional

- **Smooth experience**: Scroll otomatis jangan loncat, animasi typing halus
- **Mobile-friendly**: Input bar tetap di bawah saat keyboard muncul (viewport units)
- **Memory efficient**: Jangan render 1000 pesan DOM — virtual scroll atau batasi riwayat
- **Graceful fallback**: Kalau API mati, tampilkan pesan error + tombol retry, bukan crash
- **Privacy**: API key jangan hardcode di frontend — gunakan proxy atau env variable

---

## 🚀 Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Chat</title>
  <!-- Marked for Markdown rendering -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    /* --- RESET & VARIABLES --- */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f0f2f5;
      --chat-bg: #fff;
      --user-bubble: #3b82f6;
      --user-text: #fff;
      --ai-bubble: #f1f5f9;
      --ai-text: #1e293b;
      --input-bg: #fff;
      --border: #e2e8f0;
      --text: #1e293b;
      --muted: #94a3b8;
      --shadow: 0 4px 24px rgba(0,0,0,0.08);
    }

    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }

    .chat-container {
      width: 100%;
      max-width: 720px;
      height: 90vh;
      max-height: 800px;
      background: var(--chat-bg);
      border-radius: 1.5rem;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* --- HEADER --- */
    .chat-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-header h1 {
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .chat-header .actions { display: flex; gap: 0.5rem; }
    .chat-header button {
      background: none; border: 1px solid var(--border);
      border-radius: 0.5rem; padding: 0.4rem 0.8rem;
      cursor: pointer; font-size: 0.85rem; color: var(--muted);
    }
    .chat-header button:hover { background: var(--bg); }

    /* --- MESSAGES --- */
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      display: flex;
      gap: 0.75rem;
      max-width: 85%;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .avatar.user { background: #dbeafe; }
    .avatar.ai { background: #f1f5f9; }

    .bubble {
      padding: 0.75rem 1rem;
      border-radius: 1.2rem;
      line-height: 1.5;
      font-size: 0.95rem;
      word-wrap: break-word;
    }
    .bubble p { margin-bottom: 0.5rem; }
    .bubble p:last-child { margin-bottom: 0; }
    .bubble code {
      background: rgba(0,0,0,0.06);
      padding: 0.15rem 0.35rem;
      border-radius: 0.3rem;
      font-size: 0.85em;
    }
    .bubble pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      overflow-x: auto;
      margin: 0.5rem 0;
    }
    .bubble pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    .message.user .bubble {
      background: var(--user-bubble);
      color: var(--user-text);
      border-bottom-right-radius: 0.3rem;
    }
    .message.ai .bubble {
      background: var(--ai-bubble);
      color: var(--ai-text);
      border-bottom-left-radius: 0.3rem;
    }

    .timestamp {
      font-size: 0.7rem;
      color: var(--muted);
      margin-top: 0.25rem;
      text-align: right;
    }
    .message.user .timestamp { text-align: left; }

    /* --- TYPING INDICATOR --- */
    .typing {
      align-self: flex-start;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      padding: 0.5rem 0;
    }
    .typing .dots {
      display: flex;
      gap: 4px;
      padding: 0.75rem 1rem;
      background: var(--ai-bubble);
      border-radius: 1.2rem;
      border-bottom-left-radius: 0.3rem;
    }
    .typing .dot {
      width: 8px; height: 8px;
      background: var(--muted);
      border-radius: 50%;
      animation: bounce 1.4s infinite;
    }
    .typing .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* --- INPUT BAR --- */
    .input-area {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 0.5rem;
      background: var(--chat-bg);
    }
    .input-area textarea {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 1rem;
      font-family: inherit;
      font-size: 0.95rem;
      resize: none;
      outline: none;
      max-height: 120px;
      line-height: 1.4;
    }
    .input-area textarea:focus { border-color: var(--user-bubble); }
    .input-area button {
      padding: 0.75rem 1.2rem;
      background: var(--user-bubble);
      color: #fff;
      border: none;
      border-radius: 1rem;
      cursor: pointer;
      font-size: 1.1rem;
      transition: opacity 0.15s;
    }
    .input-area button:hover { opacity: 0.9; }
    .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }

    /* --- SUGGESTIONS --- */
    .suggestions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding: 0.5rem 1.5rem 0;
    }
    .suggestion-chip {
      padding: 0.4rem 0.8rem;
      background: var(--ai-bubble);
      border: 1px solid var(--border);
      border-radius: 2rem;
      font-size: 0.8rem;
      cursor: pointer;
      color: var(--text);
    }
    .suggestion-chip:hover { background: #e2e8f0; }

    /* --- SCROLLBAR --- */
    .messages::-webkit-scrollbar { width: 6px; }
    .messages::-webkit-scrollbar-track { background: transparent; }
    .messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="chat-container">
    <!-- HEADER -->
    <div class="chat-header">
      <h1>🤖 AI Chat</h1>
      <div class="actions">
        <button id="clearBtn">🗑 Hapus</button>
      </div>
    </div>

    <!-- SUGGESTIONS -->
    <div class="suggestions" id="suggestions">
      <span class="suggestion-chip">Apa itu JavaScript?</span>
      <span class="suggestion-chip">Buatkan puisi tentang coding</span>
      <span class="suggestion-chip">Tips belajar programming</span>
    </div>

    <!-- MESSAGES -->
    <div class="messages" id="messages">
      <div class="message ai">
        <div class="avatar ai">🤖</div>
        <div>
          <div class="bubble">
            Halo! Saya asisten AI. Ada yang bisa saya bantu? 😊
          </div>
          <div class="timestamp"><%= new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) %></div>
        </div>
      </div>
    </div>

    <!-- INPUT AREA -->
    <div class="input-area">
      <textarea id="input" rows="1" placeholder="Ketik pesan..." /></textarea>
      <button id="sendBtn">➤</button>
    </div>
  </div>

  <script>
    // --- STATE ---
    const state = {
      messages: [],         // Array of { role: 'user'|'ai', content: string }
      isTyping: false,      // Sedang mengetik?
      aborted: false,       // Stream dibatalkan?
    };

    // --- DOM REFS ---
    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn');
    const suggestionsEl = document.getElementById('suggestions');

    // --- HELPERS ---
    function getTimestamp() {
      return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // --- RENDER ---
    function addMessage(role, content) {
      const isUser = role === 'user';
      const avatar = isUser ? '👤' : '🤖';
      const htmlContent = isUser ? escapeHtml(content) : marked.parse(content);

      const div = document.createElement('div');
      div.className = `message ${role}`;
      div.innerHTML = `
        <div class="avatar ${role}">${avatar}</div>
        <div>
          <div class="bubble">${htmlContent}</div>
          <div class="timestamp">${getTimestamp()}</div>
        </div>
      `;
      messagesEl.appendChild(div);
      state.messages.push({ role, content });
      scrollToBottom();
      return div;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // --- TYPING INDICATOR ---
    function showTyping() {
      const div = document.createElement('div');
      div.className = 'typing';
      div.id = 'typingIndicator';
      div.innerHTML = `
        <div class="avatar ai">🤖</div>
        <div class="dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `;
      messagesEl.appendChild(div);
      scrollToBottom();
      state.isTyping = true;
    }

    function hideTyping() {
      const el = document.getElementById('typingIndicator');
      if (el) el.remove();
      state.isTyping = false;
    }

    // --- STREAMING TEXT EFFECT ---
    async function streamText(text, element, speed = 20) {
      const bubble = element.querySelector('.bubble');
      let index = 0;

      return new Promise(resolve => {
        function type() {
          if (state.aborted) { resolve(); return; }
          if (index < text.length) {
            // Ambil chunk — usahakan potong di spasi biar流畅
            const chunk = text.slice(0, index + 1);
            bubble.innerHTML = marked.parse(chunk);
            index++;
            scrollToBottom();
            setTimeout(type, speed);
          } else {
            resolve();
          }
        }
        type();
      });
    }

    // --- AI RESPONSE (MOCK) ---
    function getMockResponse(userMessage) {
      const msg = userMessage.toLowerCase();
      if (msg.includes('halo') || msg.includes('hai') || msg.includes('hi'))
        return 'Halo juga! Ada yang bisa saya bantu? 😊';
      if (msg.includes('siapa') && msg.includes('kamu'))
        return 'Saya asisten AI yang dibuat untuk membantu kamu belajar programming. Saya bisa jawab pertanyaan, bantu debug, atau sekedar ngobrol!';
      if (msg.includes('javascript') || msg.includes('js'))
        return 'JavaScript adalah bahasa pemrograman yang sangat versatile. Berikut beberapa konsep kunci:\n\n- **Variabel**: `let`, `const`, `var`\n- **Function**: arrow function, callback, async/await\n- **DOM Manipulation**: `document.querySelector()`\n- **Event Handling**: `addEventListener()`\n\nAda yang spesifik ingin ditanyakan?';
      if (msg.includes('puisi') || msg.includes('coding') || msg.includes('kode'))
        return 'Baris demi baris kutunggu,\nFunction demi function kurayu,\nBug bersembunyi di sudut layar,\nNamun semangatku tetap menyala.\n\n--- *Puisi Programmer* ---\n\nAda topik lain yang ingin dibahas?';
      if (msg.includes('terima kasih') || msg.includes('thanks') || msg.includes('makasih'))
        return 'Sama-sama! Senang bisa membantu 😊 Kalau ada pertanyaan lain, bilang aja ya!';

      return `Menarik! Kamu bertanya tentang "${userMessage}". Sebagai asisten AI, saya bisa bantu menjawab pertanyaan programming, menulis code, atau diskusi konsep teknis. Coba tanya lebih spesifik ya! 🚀`;
    }

    async function sendMessage(text) {
      if (!text.trim() || state.isTyping) return;

      // Add user message
      addMessage('user', text);
      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendBtn.disabled = true;

      // Simpan suggestions
      suggestionsEl.style.display = 'none';

      // Show typing indicator
      showTyping();

      // Simulate delay & generate response
      const userMsg = text.trim();
      let response;

      // --- OPTIONAL: Connect to API ---
      // Uncomment untuk konek ke OpenRouter:
      /*
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY', // GANTI!
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Kamu asisten AI yang membantu. Jawab dalam Bahasa Indonesia.' },
              ...state.messages.map(m => ({ role: m.role, content: m.content })),
            ],
            stream: false,
          }),
        });
        const data = await res.json();
        response = data.choices[0].message.content;
      } catch (err) {
        response = 'Maaf, terjadi kesalahan menghubungi AI. Coba lagi nanti.';
      }
      */

      // --- Gunakan mock response (ganti dengan API di atas kalau mau real) ---
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      response = getMockResponse(userMsg);

      hideTyping();

      // Add AI message with streaming effect
      state.aborted = false;
      const aiMsgEl = addMessage('ai', '');
      await streamText(response, aiMsgEl);

      sendBtn.disabled = false;
      inputEl.focus();
    }

    // --- EVENTS ---
    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputEl.value);
      }
    });

    // Auto-resize textarea
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
    });

    clearBtn.addEventListener('click', () => {
      if (!confirm('Hapus semua pesan?')) return;
      state.messages = [];
      messagesEl.innerHTML = '';
      state.aborted = true;
      hideTyping();
      sendBtn.disabled = false;

      // Welcome message
      addMessage('ai', 'Halo! Saya asisten AI. Ada yang bisa saya bantu? 😊');
      suggestionsEl.style.display = 'flex';
    });

    // Suggestion chips
    suggestionsEl.addEventListener('click', e => {
      if (e.target.classList.contains('suggestion-chip')) {
        sendMessage(e.target.textContent);
      }
    });

    // --- INIT ---
    inputEl.focus();
  </script>
</body>
</html>
```

> **Untuk koneksi API nyata:** Daftar di [OpenRouter](https://openrouter.ai/), dapatkan API key, ganti `YOUR_API_KEY`, dan uncomment bagian fetch di atas.

---

## 🖼 Expected Output

Chat UI akan tampil sebagai panel di tengah layar dengan:

**Header**: Judul "🤖 AI Chat" + tombol 🗑 Hapus

**Suggestion chips**: Tiga tombol kecil di bawah header — "Apa itu JavaScript?", "Buatkan puisi tentang coding", "Tips belajar programming". Klik salah satu langsung mengirim pesan.

**Message area** (scrollable):
- Pesan AI pertama sambutan: "Halo! Saya asisten AI. Ada yang bisa saya bantu? 😊"
- Pesan user: bubble biru di kanan dengan avatar 👤
- Pesan AI: bubble abu-abu di kiri dengan avatar 🤖
- Setiap bubble punya timestamp
- Bubble AI support Markdown: teks **bold**, `inline code`, list, dan code block (pre)
- Animasi fade-in setiap pesan baru

**Typing indicator**: Saat AI sedang "mengetik", muncul tiga titik animasi di kiri

**Streaming text**: Teks AI muncul karakter per karakter (efek realistis seperti AI sedang ngetik)

**Input bar**: Textarea di bawah (auto-resize) + tombol ➤. Enter kirim, Shift+Enter newline.

**Clear**: Tombol hapus menghapus semua pesan dan menampilkan ulang sambutan.

---

## 💡 Latihan Tambahan

1. **OpenRouter Integration**: Hubungkan ke API nyata — ganti mock response dengan fetch ke OpenRouter
2. **Streaming Response**: Gunakan `fetch` dengan `response.body` reader untuk stream real-time (SSE)
3. **Dark Mode**: Toggle CSS variables untuk tema gelap
4. **Copy Code Button**: Tambah tombol "📋 Copy" di pojok kanan atas setiap code block
5. **Message Search**: Cari teks dalam riwayat percakapan
6. **Export Chat**: Download riwayat chat sebagai file `.txt` atau `.md`
7. **Voice Input**: Gunakan `webkitSpeechRecognition` untuk input suara
8. **Edit / Delete Message**: Klik kanan pada bubble untuk edit atau hapus
9. **Multi-model Selector**: Dropdown untuk ganti model AI (GPT-4, Claude, Llama)
10. **Markdown Editor**: Textarea dengan preview Markdown untuk input user

---

## 📝 Rubrik Penilaian

| Kriteria | Belum (0) | Cukup (1) | Baik (2) | Istimewa (3) |
|----------|-----------|-----------|----------|--------------|
| **Chat UI** | HTML polos | Bubble + avatar | + Timestamp + scroll auto | + Animasi + Markdown render |
| **Input & Submit** | Tidak bisa kirim | Enter atau klik | + Both + auto-resize | + Shift+Enter newline + disabled state |
| **Typing & Streaming** | Langsung tampil | Typing indicator | + Streaming karakter per karakter | + Abort + speed control |
| **Markdown Support** | Teks polos | Bold + italic | + List + link | + Code block + syntax highlight |
| **State Management** | Inline DOM | Array messages | + Message count + clear | + localStorage persist |
| **API Integration** | Mock response | Fetch ke API (blocking) | + Error handling + loading | + Streaming + cancel |

---

## 📚 Referensi

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Marked Library](https://marked.js.org/)
- [Highlight.js](https://highlightjs.org/)
- [MDN: EventSource (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
