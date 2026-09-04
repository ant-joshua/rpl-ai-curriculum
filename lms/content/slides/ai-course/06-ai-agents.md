---
title: "AI Agents: AI yang Bekerja untuk Kamu"
module: 6
course: "ai-complete-course"
---

# Module 6: AI Agents — AI yang Bekerja untuk Kamu

> "AI Agent bukan sekadar chatbot — ini adalah asisten digital yang bisa merencanakan, mengeksekusi, dan memverifikasi tugas secara otonom."

---

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan bisa:
- Membedakan AI Agent dari chatbot biasa
- Memahami siklus kerja agent: plan → execute → verify
- Mengenal contoh AI Agent yang sudah ada
- Memahami konsep multi-agent systems
- Memahami tools & function calling
- Membayangkan bagaimana membangun agent sederhana

---

## 🤖 AI Agent vs Chat Biasa

### Perbedaan Fundamental

```
CHATBOT BIASA:
User: "Buatkan website toko online"
AI: "Berikut langkah-langkah membuat website..."
→ AI memberikan JAWABAN, USER yang eksekusi

AI AGENT:
User: "Buatkan website toko online"
Agent: 
  1. Menganalisis kebutuhan
  2. Membuat struktur file
  3. Menulis kode HTML/CSS/JS
  4. Testing di local server
  5. Deploy ke hosting
→ AI MELAKUKAN eksekusi, user hanya mengarahkan
```

### Tabel Perbandingan

| Aspek | Chatbot | AI Agent |
|-------|---------|----------|
| **Interaksi** | Tanya jawab | Multi-step execution |
| **Output** | Teks/jawaban | Tindakan nyata |
| **Tools** | Tidak punya | Akses ke tools eksternal |
| **Autonomi** | Reaktif | Proaktif + otonom |
| **Memory** | Sesi percakapan | Long-term memory |
| **Looping** | Single turn | Plan → Execute → Verify → Loop |
| **Complexity** | Sederhana | Kompleks, multi-tahap |
| **Error Handling** | "Maaf tidak bisa" | Coba pendekatan lain |

---

## ⚙️ Cara Kerja AI Agent

### Siklus Dasar: Plan → Execute → Verify

```
┌─────────────────────────────────────────┐
│            AI AGENT LIFECYCLE            │
│                                         │
│  ┌─────────┐                            │
│  │  PLAN   │ ← Menganalisis &          │
│  │         │   merencanakan langkah     │
│  └────┬────┘                            │
│       ↓                                 │
│  ┌─────────┐                            │
│  │ EXECUTE │ ← Melakukan aksi nyata     │
│  │         │   menggunakan tools        │
│  └────┬────┘                            │
│       ↓                                 │
│  ┌─────────┐                            │
│  │ VERIFY  │ ← Memeriksa hasil &        │
│  │         │   memvalidasi output       │
│  └────┬────┘                            │
│       ↓                                 │
│  ┌─────────┐                            │
│  │ REFLECT │ ← Evaluasi & rencana      │
│  │         │   perbaikan jika perlu     │
│  └────┬────┘                            │
│       │                                 │
│       └──→ Kembali ke PLAN (loop)       │
│                                         │
└─────────────────────────────────────────┘
```

### Contoh Siklus Agent dalam Praktik

```python
# Simulasi siklus agent untuk membuat API endpoint

class SimpleAgent:
    def __init__(self, task):
        self.task = task
        self.memory = []
        self.step_count = 0
    
    def plan(self, task):
        """LANGKAH 1: Analisis dan perencanaan"""
        plan = {
            "goal": task,
            "steps": [
                "Define database schema",
                "Create FastAPI project structure",
                "Implement CRUD endpoints",
                "Add authentication",
                "Write tests",
                "Deploy"
            ],
            "estimated_time": "2 hours",
            "tools_needed": ["terminal", "editor", "database"]
        }
        self.memory.append(("plan", plan))
        return plan
    
    def execute(self, step):
        """LANGKAH 2: Eksekusi menggunakan tools"""
        result = {
            "step": step,
            "status": "completed",
            "output": f"File created: {step.lower().replace(' ', '_')}.py",
            "tools_used": ["terminal", "editor"]
        }
        self.memory.append(("execute", result))
        return result
    
    def verify(self, execution_result):
        """LANGKAH 3: Verifikasi hasil"""
        verification = {
            "step": execution_result["step"],
            "checks": [
                "Code syntax valid: ✅",
                "Tests passing: ✅",
                "No security issues: ✅",
                "Performance acceptable: ✅"
            ],
            "status": "verified"
        }
        self.memory.append(("verify", verification))
        return verification
    
    def reflect(self, verification_result):
        """LANGKAH 4: Evaluasi dan putuskan langkah selanjutnya"""
        if all("✅" in check for check in verification_result["checks"]):
            return {"action": "proceed", "message": "Step verified, moving to next"}
        else:
            return {"action": "retry", "message": "Issues found, need to fix"}
    
    def run(self):
        """Menjalankan siklus agent penuh"""
        plan = self.plan(self.task)
        
        for step in plan["steps"]:
            self.step_count += 1
            print(f"\n{'='*50}")
            print(f"Step {self.step_count}: {step}")
            
            # Execute
            result = self.execute(step)
            print(f"  Executed: {result['output']}")
            
            # Verify
            verification = self.verify(result)
            print(f"  Verified: {verification['status']}")
            
            # Reflect
            reflection = self.reflect(verification)
            print(f"  Decision: {reflection['message']}")
            
            if reflection["action"] == "retry":
                print("  ⚠️ Retrying this step...")

# Usage
agent = SimpleAgent("Build REST API for todo app")
agent.run()
```

---

## 🛠️ Contoh AI Agent yang Sudah Ada

### Perbandingan AI Agent Populer

| Agent | Developer | Tipe | Keunggulan | Harga |
|-------|----------|------|-----------|-------|
| **Claude Code** | Anthropic | Coding Agent | Terminal access, file ops | Pro $20/bln |
| **GitHub Copilot** | GitHub/Microsoft | Code Assistant | IDE integration, autocompletion | $10-19/bln |
| **Cursor** | Cursor Inc | AI IDE | Full IDE + AI, multi-file edit | Gratis/$20/bln |
| **Devin** | Cognition AI | Software Engineer | Full autonomous dev | $500/bln |
| **Hermes Agent** | Nous Research | General Agent | Multi-tool, multi-provider | Gratis/Open |
| **AutoGPT** | Significant Gravitas | General Agent | Open source, customizable | Gratis |
| **Manus AI** | Manus | General Agent | Browser automation, tasks | Early access |

### Detail Setiap Agent

#### 🔵 Claude Code (Anthropic)

```bash
# Claude Code berjalan di terminal
$ claude-code

> Buka file app.py dan tambahkan endpoint /health
# Claude Code:
# 1. Membaca file app.py
# 2. Memahami struktur kode
# 3. Menambahkan endpoint baru
# 4. Menjalankan test
# 5. Melaporkan hasil
```

**Fitur utama:**
- Akses langsung ke terminal
- Bisa membaca, menulis, dan mengedit file
- Menjalankan perintah shell
- Multi-file editing
- Context window sangat besar (200K token)

#### 🟢 GitHub Copilot

```
Fitur utama:
- Autocomplete kode real-time di VS Code/JetBrains
- Chat Copilot untuk tanya coding
- Copilot Workspace untuk multi-file changes
- Copilot CLI untuk perintah terminal
```

#### 🟡 Cursor

```
Fitur utama:
- AI-native code editor (fork VS Code)
- Cmd+K: Edit kode dengan natural language
- Cmd+L: Chat dengan AI tentang codebase
- Composer: Multi-file edit dalam satu prompt
- Bug Finder: Deteksi bug otomatis
```

#### 🔴 Devin (Cognition AI)

```
Fitur utama:
- AI "software engineer" penuh
- Bisa: browse web, coding, testing, deploy
- Menerima task dari ticket/issue
- Bekerja secara otonom sampai selesai
- Collaborative: manusia bisa review & approve
```

#### 🟣 Hermes Agent (Nous Research)

```
Fitur utama:
- General-purpose agent
- Multi-tool: terminal, web, files, vision
- Multi-provider: bisa pakai berbagai LLM
- Skills system untuk knowledge reusable
- Session memory dan context management
```

---

## 🔄 Multi-Agent Systems

### Apa itu Multi-Agent?

```
SINGLE AGENT:
User → Agent → Output

MULTI-AGENT:
User → Coordinator Agent
            ├── Planner Agent (merencanakan)
            ├── Coder Agent (menulis kode)
            ├── Reviewer Agent (mereview)
            ├── Tester Agent (testing)
            └── Deploy Agent (deployment)
            → Coordinator mengumpulkan hasil
            → Output final
```

### Contoh Arsitektur Multi-Agent

```python
# Konsep Multi-Agent System

class MultiAgentSystem:
    """Simulasi multi-agent collaboration"""
    
    def __init__(self):
        self.agents = {
            "planner": Agent("planner", "Merencanakan dan mendesain solusi"),
            "coder": Agent("coder", "Menulis kode berdasarkan spesifikasi"),
            "reviewer": Agent("reviewer", "Review kode dan cari bug"),
            "tester": Agent("tester", "Menulis dan menjalankan test"),
        }
        self.workflow = ["planner", "coder", "reviewer", "tester"]
    
    def execute(self, task):
        """Menjalankan task melalui pipeline multi-agent"""
        context = {"task": task}
        
        for agent_name in self.workflow:
            agent = self.agents[agent_name]
            print(f"\n🤖 {agent_name.upper()} is working...")
            
            result = agent.process(context)
            context[f"{agent_name}_output"] = result
            
            print(f"   Output: {result['summary']}")
        
        return context

class Agent:
    def __init__(self, name, role):
        self.name = name
        self.role = role
    
    def process(self, context):
        """Proses input dan menghasilkan output"""
        # Setiap agent menggunakan LLM dengan system prompt berbeda
        system_prompt = f"You are a {self.role}. Current task: {context['task']}"
        
        # Dalam implementasi nyata, ini memanggil LLM API
        return {
            "agent": self.name,
            "summary": f"{self.name} telah menyelesaikan bagian {self.role}",
            "details": f"Output spesifik dari {self.name}"
        }

# Usage
system = MultiAgentSystem()
result = system.execute("Build a user authentication API")
```

---

## 🔧 Tools & Function Calling

### Apa itu Function Calling?

**Function Calling** adalah kemampuan AI untuk **memanggil fungsi/program** yang sudah didefinisikan.

```
Tanpa Function Calling:
User: "Cuaca Jakarta hari ini?"
AI: "Maaf, saya tidak bisa mengecek cuaca real-time."

Dengan Function Calling:
User: "Cuaca Jakarta hari ini?"
AI: [memanggil fungsi get_weather(city="Jakarta")]
AI: "Cuaca Jakarta hari ini: 32°C, cerah berawan, kelembaban 75%"
```

### Contoh Function Calling

```python
# Definisi tools yang tersedia untuk AI agent

tools = [
    {
        "name": "search_web",
        "description": "Mencari informasi di internet",
        "parameters": {
            "query": {"type": "string", "description": "Kata kunci pencarian"}
        }
    },
    {
        "name": "run_code",
        "description": "Menjalankan kode Python",
        "parameters": {
            "code": {"type": "string", "description": "Kode Python yang akan dijalankan"}
        }
    },
    {
        "name": "send_email",
        "description": "Mengirim email",
        "parameters": {
            "to": {"type": "string", "description": "Alamat email penerima"},
            "subject": {"type": "string", "description": "Subjek email"},
            "body": {"type": "string", "description": "Isi email"}
        }
    },
    {
        "name": "create_file",
        "description": "Membuat file baru",
        "parameters": {
            "path": {"type": "string", "description": "Path file"},
            "content": {"type": "string", "description": "Isi file"}
        }
    },
    {
        "name": "database_query",
        "description": "Query database",
        "parameters": {
            "query": {"type": "string", "description": "SQL query"},
            "database": {"type": "string", "description": "Nama database"}
        }
    }
]

# Contoh agent menggunakan tools
class ToolAgent:
    def __init__(self, tools):
        self.tools = tools
        self.available_tools = {t["name"]: t for t in tools}
    
    def process(self, user_request):
        """AI memutuskan tool mana yang digunakan"""
        
        # Dalam implementasi nyata, LLM memilih tool
        # Berikut simulasi keputusan agent
        
        if "cari" in user_request or "search" in user_request:
            return self.execute_tool("search_web", query=user_request)
        elif "jalankan" in user_request or "run" in user_request:
            return self.execute_tool("run_code", code=user_request)
        elif "email" in user_request or "kirim" in user_request:
            return self.execute_tool("send_email", **self.parse_email(user_request))
        else:
            return "Saya tidak tahu tool apa yang harus digunakan."
    
    def execute_tool(self, tool_name, **kwargs):
        """Eksekusi tool yang dipilih"""
        if tool_name in self.available_tools:
            # Dalam implementasi nyata, ini menjalankan fungsi asli
            return f"Tool '{tool_name}' executed with: {kwargs}"
        return f"Tool '{tool_name}' not found"

# Usage
agent = ToolAgent(tools)
result = agent.process("Cari informasi tentang Python FastAPI")
print(result)
```

---

## 🧠 Agent Memory

### Jenis Memory dalam AI Agent

```
┌──────────────────────────────────────────┐
│              AGENT MEMORY                │
├──────────────────────────────────────────┤
│                                          │
│  1. WORKING MEMORY (短期记忆)            │
│     └── Konteks percakapan saat ini      │
│     └── Sesaat, hilang setelah sesi      │
│                                          │
│  2. EPISODIC MEMORY ( episodic)          │
│     └── Pengalaman masa lalu             │
│     └── "Kemarin saya error di sini"     │
│                                          │
│  3. SEMANTIC MEMORY (语义记忆)           │
│     └── Pengetahuan umum                 │
│     └── "Python pakai indentasi"         │
│                                          │
│  4. PROCEDURAL MEMORY (程序记忆)         │
│     └── Cara melakukan sesuatu           │
│     └── "Langkah deploy ke Vercel"       │
│                                          │
└──────────────────────────────────────────┘
```

### Implementasi Memory

```python
# Agent Memory System

class AgentMemory:
    """Manages different types of agent memory"""
    
    def __init__(self):
        self.working_memory = []      # Current session context
        self.episodic_memory = []     # Past experiences
        self.semantic_memory = {}     # Learned knowledge
        self.procedural_memory = {}   # Step-by-step procedures
    
    def add_working(self, item):
        """Add to current working memory"""
        self.working_memory.append(item)
        # Keep only last 10 items (limited capacity)
        if len(self.working_memory) > 10:
            self.working_memory.pop(0)
    
    def add_episode(self, task, result, lessons):
        """Record an experience for future reference"""
        self.episodic_memory.append({
            "task": task,
            "result": result,
            "lessons": lessons,
            "timestamp": "now"
        })
    
    def add_knowledge(self, key, value):
        """Store learned knowledge"""
        self.semantic_memory[key] = value
    
    def add_procedure(self, task_type, steps):
        """Store a proven procedure"""
        self.procedural_memory[task_type] = steps
    
    def recall_similar(self, current_task):
        """Find relevant past experiences"""
        relevant = []
        for episode in self.episodic_memory:
            # Simple similarity: check if task words overlap
            task_words = set(current_task.lower().split())
            episode_words = set(episode["task"].lower().split())
            overlap = len(task_words & episode_words)
            if overlap > 0:
                relevant.append(episode)
        return relevant
    
    def get_procedure(self, task_type):
        """Get known procedure for a task type"""
        return self.procedural_memory.get(task_type, None)

# Usage
memory = AgentMemory()

# Agent learns from experience
memory.add_episode(
    task="Deploy Flask app to Vercel",
    result="success",
    lessons=["Need vercel.json", "Use gunicorn", "Set Python version"]
)

# Agent recalls when facing similar task
past = memory.recall_similar("Deploy Django app to Vercel")
# Returns the Flask deployment episode → agent can apply similar steps
```

---

## 🌍 Real-World Agent Workflows

### Workflow 1: Automated Code Review

```
GitHub Issue/PR → Agent → [Plan] → [Read Code] → [Analyze] → [Review Comment]
                                        ↓
                                   [Run Tests]
                                        ↓
                                   [Check Security]
                                        ↓
                                   [Post Review di GitHub]
```

### Workflow 2: Data Analysis Pipeline

```
CSV Upload → Agent → [Load Data] → [Clean Data] → [Analyze] → [Generate Charts]
                                                                     ↓
                                                              [Write Report]
                                                                     ↓
                                                              [Email Report]
```

### Workflow 3: Customer Support Agent

```
Customer Message → Agent → [Classify Intent] → [Retrieve Knowledge Base]
                                                      ↓
                                              [Generate Response]
                                                      ↓
                                              [Check Policy Compliance]
                                                      ↓
                                              [Send Response OR Escalate to Human]
```

### Workflow 4: Content Creation Pipeline

```
Topic Brief → Agent → [Research] → [Outline] → [Draft] → [Edit] → [SEO Optimize]
                                                                        ↓
                                                                 [Publish to CMS]
```

---

## 🏗️ Build Your Own Simple Agent (Konsep)

```python
# Konsep membangun AI Agent sederhana

class PersonalAssistantAgent:
    """
    AI Agent sederhana yang bisa:
    1. Menerima tugas dari user
    2. Merencanakan langkah
    3. Mengeksekusi dengan tools
    4. Memverifikasi hasil
    """
    
    def __init__(self, name="MyAgent"):
        self.name = name
        self.memory = AgentMemory()
        self.tools = self._init_tools()
        self.plan = []
    
    def _init_tools(self):
        """Definisi tools yang tersedia"""
        return {
            "web_search": self._web_search,
            "write_file": self._write_file,
            "run_python": self._run_python,
            "send_notification": self._notify,
        }
    
    def receive_task(self, task):
        """Menerima tugas dari user"""
        print(f"📋 Task received: {task}")
        
        # Plan
        self.plan = self._create_plan(task)
        print(f"📝 Plan created: {len(self.plan)} steps")
        
        # Execute & Verify
        results = []
        for i, step in enumerate(self.plan):
            print(f"\n🔄 Step {i+1}/{len(self.plan)}: {step['action']}")
            
            result = self._execute_step(step)
            
            if self._verify_result(result):
                print(f"✅ Step {i+1} completed successfully")
                results.append(result)
            else:
                print(f"⚠️ Step {i+1} needs retry")
                # Could implement retry logic here
        
        # Summarize
        return self._summarize(results)
    
    def _create_plan(self, task):
        """Buat rencana langkah"""
        # In real implementation, use LLM to create plan
        return [
            {"action": "Analyze requirements", "tool": None},
            {"action": "Search for information", "tool": "web_search"},
            {"action": "Write solution", "tool": "write_file"},
            {"action": "Test solution", "tool": "run_python"},
        ]
    
    def _execute_step(self, step):
        """Eksekusi satu langkah"""
        tool = step.get("tool")
        if tool and tool in self.tools:
            return self.tools[tool](step["action"])
        return {"status": "manual_action_needed", "step": step}
    
    def _verify_result(self, result):
        """Verifikasi hasil eksekusi"""
        return result.get("status") == "success"
    
    def _summarize(self, results):
        """Ringkasan hasil"""
        return {
            "total_steps": len(self.plan),
            "completed": len([r for r in results if r.get("status") == "success"]),
            "results": results
        }
    
    # Tool implementations (stubs)
    def _web_search(self, query): return {"status": "success", "data": "..."}
    def _write_file(self, content): return {"status": "success", "path": "output.txt"}
    def _run_python(self, code): return {"status": "success", "output": "..."}
    def _notify(self, msg): return {"status": "success", "notified": True}

# Usage
agent = PersonalAssistantAgent("HermesMini")
result = agent.receive_task("Buatkan script Python untuk menghitung BMI")
print(f"\n📊 Summary: {result}")
```

---

## 📝 Ringkasan Modul 6

```
✅ AI Agent = chatbot + tools + memory + autonomous execution
✅ Siklus kerja: Plan → Execute → Verify → Reflect → Loop
✅ Agent populer: Claude Code, Copilot, Cursor, Devin, Hermes
✅ Multi-agent = beberapa agent bekerja sama dengan role berbeda
✅ Function calling memungkinkan AI "melakukan" sesuatu di dunia nyata
✅ Agent memory: working, episodic, semantic, procedural
✅ Real-world workflows: code review, data analysis, support, content
```

---

## 🔑 Key Takeaways

1. **Agent ≠ Chatbot** — Agent bisa melakukan tugas nyata, bukan hanya menjawab pertanyaan
2. **Siklus Plan-Execute-Verify** adalah fondasi semua agent — pelajari ini baik-baik
3. **Function calling adalah jembatan** antara AI dan dunia nyata — tanpa ini, AI hanya bisa bicara
4. **Memory membuat agent cerdas** — tanpa memory, agent harus mulai dari nol setiap kali
5. **Multi-agent adalah masa depan** — kompleksitas tugas membutuhkan kolaborasi antar agent

---

## 🏋️ Practice Exercises

### Exercise 1: Rencana Agent
Untuk tugas "Membuat website portfolio pribadi", buatkan rencana lengkap agent: langkah-langkah, tools yang dibutuhkan, dan criteria verifikasi per langkah.

### Exercise 2: Bandingkan Agent
Gunakan Claude Code dan Cursor (atau Copilot) untuk tugas coding yang sama. Bandingkan pendekatan, kecepatan, dan kualitas hasilnya.

### Exercise 3: Desain Multi-Agent
Desain arsitektur multi-agent untuk "Otomatisasi laporan keuangan bulanan". Tentukan: agent apa saja, role masing-masing, dan bagaimana mereka berkolaborasi.

### Exercise 4: Fungsi Calling
Definisikan 5 tools/fungsi yang akan berguna untuk AI agent pribadi kamu. Untuk setiap tool, tulis: nama, deskripsi, parameter, dan contoh penggunaan.

### Exercise 5: Konsep Agent Sederhana
Tulis pseudocode untuk AI agent sederhana yang bisa: (1) menerima tugas dari chat, (2) memecahnya jadi sub-tugas, (3) mengeksekusi satu per satu, (4) melaporkan hasil.

---

## 🚀 Next Module: Use Case Sehari-hari dengan AI

> Di **Module 7** (terakhir!), kita akan mengaplikasikan semua ilmu ke **10 kategori use case sehari-hari** — dari memasak, keuangan, jadwal, komunikasi, brainstorming, hingga travel planning. Setiap kategori dilengkapi **3-5 prompt siap pakai** yang langsung bisa kamu gunakan!
