# Session 02: Multi-Agent Workflow

> **Level:** Advanced  
> **Duration:** 2–3 hours  
> **Objective:** Bangun multi-agent workflow dengan orchestrator + worker pattern. Pahami role-based agents, tools delegation, context isolation.

---

## 1. Orchestrator + Worker Pattern

Pattern paling fundamental di multi-agent systems. Satu **orchestrator agent** manage beberapa **worker agents** yang masing-masing handle subtask spesifik.

```
┌─────────────────────────────┐
│      Orchestrator Agent     │
│  - breakdown task           │
│  - delegate to workers      │
│  - aggregate results        │
│  - quality check            │
└──────┬──────┬──────┬───────┘
       │      │      │
       ▼      ▼      ▼
┌────────┐┌────────┐┌────────┐
│ Worker1 ││Worker2 ││Worker3 │
│ Frontend││ Backend││ QA     │
└────────┘└────────┘└────────┘
```

### Orchestrator Responsibilities

| Task | Description |
|------|-------------|
| **Task breakdown** | Pecah task besar jadi sub-task kecil yang independen |
| **Delegation** | Assign sub-task ke worker agent yang tepat |
| **Context passing** | Berikan context yang relevan ke setiap worker |
| **Parallel/sequential** | Tentukan mana yang bisa parallel, mana sequential |
| **Result aggregation** | Gabung hasil dari semua worker |
| **Quality check** | Validasi hasil sebelum final |

### Worker Responsibilities

| Task | Description |
|------|-------------|
| **Execution** | Kerjakan sub-task sesuai instruksi |
| **Reporting** | Laporkan hasil + status |
| **Error handling** | Tangani error lokal, report ke orchestrator |
| **Context isolation** | Tidak perlu tahu task worker lain |

---

## 2. Role-Based Agents

Assign roles ke workers berdasarkan expertise:

### Frontend Agent

```python
frontend_agent_prompt = """You are a Frontend Development Agent.
Your expertise:
- React/Next.js, Tailwind CSS, TypeScript
- Responsive design, accessibility
- Component architecture
- State management

Task: {task}
Context: {context}
Output: Complete frontend code with:
- Component files
- Styles
- Tests (if applicable)
- Usage example
"""
```

### Backend Agent

```python
backend_agent_prompt = """You are a Backend Development Agent.
Your expertise:
- Python/FastAPI, Node.js/NestJS
- Database design, API design
- Authentication, authorization
- Performance optimization

Task: {task}
Context: {context}
Output: Complete backend code with:
- API endpoints
- Database models
- Business logic
- Tests
- Documentation
"""
```

### QA Agent

```python
qa_agent_prompt = """You are a QA/Testing Agent.
Your expertise:
- Unit testing, integration testing, E2E testing
- Test coverage analysis
- Bug detection and reporting
- Performance testing

Task: {task}
Context: {context}
Output: Test suite with:
- Test files
- Test data/fixtures
- Coverage report
- Bug reports (if found)
"""
```

### Reviewer Agent

```python
reviewer_agent_prompt = """You are a Code Review Agent.
Your expertise:
- Code quality, best practices
- Security vulnerabilities
- Performance bottlenecks
- Architecture review

Task: Review the following code
Code: {code}
Context: {context}
Output: Review report with:
- Issues found (severity: high/medium/low)
- Suggestions for improvement
- Security concerns
- Performance notes
"""
```

---

## 3. Tools Delegation

Setiap agent bisa punya akses ke tools berbeda. Orchestrator manage tool assignment.

```python
# Tool definitions
tools = {
    "web_search": WebSearchTool(),
    "file_ops": FileOperationsTool(),
    "code_execution": CodeExecutionTool(),
    "terminal": TerminalTool(),
    "git": GitTool(),
    "database": DatabaseTool(),
}

# Agent-tool mapping
agent_tools = {
    "orchestrator": ["web_search", "file_ops"],
    "frontend": ["file_ops", "terminal"],
    "backend": ["file_ops", "terminal", "database"],
    "qa": ["code_execution", "file_ops"],
    "reviewer": ["file_ops", "terminal"],
}
```

### Tool Types

| Tool | Purpose | Access Control |
|------|---------|---------------|
| **Web Search** | Research, documentation lookup | Orchestrator only |
| **File Ops** | Read/write files | All agents |
| **Code Execution** | Run tests, lint, build | QA, Reviewer |
| **Terminal** | Install packages, run commands | Dev agents |
| **Git** | Commit, branch, PR | Orchestrator |
| **Database** | Query, migrate | Backend only |

---

## 4. Context Isolation

Penting untuk maintain **context boundaries** antar agents.

### Per-Agent Context

Setiap worker hanya terima context yang relevan:

```python
# BAD — semua context ke semua agent
orchestrator.broadcast(full_context)

# GOOD — filtered context per agent
orchestrator.delegate("frontend", {
    "task": "Build login page",
    "context": {
        "api_spec": api_spec,
        "design_tokens": design_tokens,
        "user_flow": "login → dashboard",
    }
})

orchestrator.delegate("backend", {
    "task": "Build auth API",
    "context": {
        "database_schema": db_schema,
        "auth_provider": "JWT",
        "security_requirements": reqs,
    }
})
```

### Shared Knowledge

Beberapa context perlu di-share:

```python
shared_knowledge = {
    "project_root": "/projects/my-app",
    "coding_standards": "PEP8, TypeScript strict",
    "git_branch": "feature/auth-system",
    "main_language": "Python 3.11",
}
```

### Context Isolation Rules

1. **Need-to-know basis** — worker hanya terima context yang diperlukan
2. **No cross-agent communication** — worker komunikasi cuma via orchestrator
3. **Shared knowledge is read-only** — worker baca shared context, jangan ubah
4. **Result is owned** — worker output = milik worker, orchestrator yang aggregate

---

## 5. Parallel vs Sequential

### Parallel Execution

Gunakan ketika tasks independent:

```python
async def execute_parallel():
    """Frontend + Backend bisa parallel karena independent tasks"""
    tasks = [
        delegate("frontend", {"task": "Build UI components"}),
        delegate("backend", {"task": "Build API endpoints"}),
    ]
    results = await asyncio.gather(*tasks)
    return results
```

### Sequential Execution

Gunakan ketika ada dependency:

```python
async def execute_sequential():
    """Backend dulu, baru QA karena QA butuh backend code"""
    backend_result = await delegate("backend", {"task": "Build API"})
    qa_result = await delegate("qa", {
        "task": "Test API",
        "depends_on": backend_result
    })
    return [backend_result, qa_result]
```

### Hybrid

```python
async def execute_hybrid():
    """Parallel frontend + backend, sequential QA setelah keduanya selesai"""
    # Stage 1: parallel
    fe_task = delegate("frontend", {"task": "UI"})
    be_task = delegate("backend", {"task": "API"})
    fe_result, be_result = await asyncio.gather(fe_task, be_task)

    # Stage 2: sequential
    qa_result = await delegate("qa", {
        "task": "Integration test",
        "context": {"frontend": fe_result, "backend": be_result}
    })

    # Stage 3: parallel review
    reviews = await asyncio.gather(
        delegate("reviewer", {"code": fe_result}),
        delegate("reviewer", {"code": be_result}),
        delegate("reviewer", {"code": qa_result}),
    )

    return {
        "frontend": fe_result,
        "backend": be_result,
        "qa": qa_result,
        "reviews": reviews,
    }
```

---

## 6. Master Script: Orchestrator Workflow

Full orchestrator implementation:

```python
#!/usr/bin/env python3
"""Orchestrator — manage multi-agent workflow for feature development."""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List

class Orchestrator:
    def __init__(self, project_root: str, model: str = "claude-3.5-sonnet"):
        self.project_root = project_root
        self.model = model
        self.agents = {}
        self.results = {}
        self.shared_knowledge = {}

    def register_agent(self, name: str, role: str, tools: List[str]):
        self.agents[name] = {
            "role": role,
            "tools": tools,
            "prompt": self._load_role_prompt(role)
        }

    def set_shared_knowledge(self, knowledge: Dict[str, Any]):
        self.shared_knowledge = knowledge

    async def delegate(self, agent_name: str, task: Dict[str, Any]) -> Dict[str, Any]:
        """Delegate task to agent, return result."""
        if agent_name not in self.agents:
            raise ValueError(f"Agent {agent_name} not registered")

        print(f"[{datetime.now()}] Delegating to {agent_name}: {task['task']}")

        # Build agent prompt with context
        agent_prompt = self.agents[agent_name]["prompt"].format(
            task=task["task"],
            context=json.dumps(task.get("context", {}), indent=2),
            shared=json.dumps(self.shared_knowledge, indent=2),
            tools=", ".join(self.agents[agent_name]["tools"])
        )

        # Simulate agent execution (in real system, call LLM)
        result = await self._execute_agent(agent_name, agent_prompt)
        self.results[agent_name] = result
        return result

    async def _execute_agent(self, name: str, prompt: str) -> Dict[str, Any]:
        """Execute agent — real implementation would call LLM API."""
        # Placeholder: dalam implementasi nyata, ini call ke Claude/Codex/etc
        return {
            "agent": name,
            "status": "completed",
            "output": f"[{name}] Task completed at {datetime.now()}"
        }

    def aggregate_results(self) -> Dict[str, Any]:
        """Gabung semua hasil worker."""
        return {
            "timestamp": datetime.now().isoformat(),
            "project": self.shared_knowledge.get("project_name"),
            "agents": list(self.agents.keys()),
            "results": self.results,
            "summary": self._generate_summary()
        }

    def _generate_summary(self) -> str:
        """Generate ringkasan eksekusi."""
        completed = [k for k, v in self.results.items()
                     if v.get("status") == "completed"]
        return f"{len(completed)}/{len(self.agents)} agents completed"

    async def run_feature_workflow(self, feature_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Run complete feature development workflow."""
        print(f"=== Starting feature: {feature_spec['name']} ===")

        # Register default agents
        self.register_agent("frontend", "frontend", ["file_ops", "terminal"])
        self.register_agent("backend", "backend", ["file_ops", "terminal", "database"])
        self.register_agent("qa", "qa", ["code_execution", "file_ops"])
        self.register_agent("reviewer", "reviewer", ["file_ops", "terminal"])

        # Stage 1: Parallel FE + BE
        fe_task = self.delegate("frontend", {
            "task": feature_spec.get("frontend_task"),
            "context": {"spec": feature_spec}
        })
        be_task = self.delegate("backend", {
            "task": feature_spec.get("backend_task"),
            "context": {"spec": feature_spec}
        })
        fe_result, be_result = await asyncio.gather(fe_task, be_task)

        # Stage 2: Sequential QA
        qa_result = await self.delegate("qa", {
            "task": f"Test feature: {feature_spec['name']}",
            "context": {"frontend": fe_result, "backend": be_result}
        })

        # Stage 3: Review
        review_results = await asyncio.gather(
            self.delegate("reviewer", {"task": "Review FE", "context": fe_result}),
            self.delegate("reviewer", {"task": "Review BE", "context": be_result}),
            self.delegate("reviewer", {"task": "Review tests", "context": qa_result}),
        )

        return self.aggregate_results()


# ===== Usage =====
async def main():
    orchestrator = Orchestrator(project_root="/projects/my-app")

    feature = {
        "name": "User Authentication",
        "frontend_task": "Build login/register page with form validation",
        "backend_task": "Build auth API with JWT + refresh tokens",
    }

    result = await orchestrator.run_feature_workflow(feature)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 7. Error Handling & Recovery

### Worker Error

```python
async def delegate_with_retry(self, agent_name: str, task: Dict[str, Any],
                               max_retries: int = 3) -> Dict[str, Any]:
    """Delegate dengan retry logic."""
    for attempt in range(max_retries):
        try:
            return await self.delegate(agent_name, task)
        except Exception as e:
            print(f"[{agent_name}] Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                return {"status": "failed", "error": str(e)}
```

### Orchestrator Recovery

```python
async def recover_failed_agent(self, failed_agent: str, result: Dict[str, Any]):
    """Recovery strategy: reassign atau fallback."""
    print(f"Recovering {failed_agent}...")

    # Option 1: Reassign to another agent with same role
    if failed_agent == "frontend":
        return await self.delegate("backend", {
            "task": "Handle FE failure",
            "context": result
        })

    # Option 2: Simplify task
    return await self.delegate("qa", {
        "task": "Validate partial output",
        "context": result
    })
```

---

## 8. Latihan

### Latihan 1: Build Orchestrator + 3 Workers

Buat orchestrator workflow sederhana (Python) dengan:

1. **Orchestrator** — manage task breakdown + aggregation
2. **Worker 1: Generator** — generate code dari spec
3. **Worker 2: Reviewer** — review generated code
4. **Worker 3: Tester** — generate + run tests

**Spec:**

```python
spec = {
    "name": "Calculator API",
    "endpoints": [
        {"method": "POST", "path": "/add", "params": ["a", "b"]},
        {"method": "POST", "path": "/subtract", "params": ["a", "b"]},
        {"method": "POST", "path": "/multiply", "params": ["a", "b"]},
        {"method": "POST", "path": "/divide", "params": ["a", "b"]},
    ],
    "framework": "FastAPI",
    "language": "Python 3.11",
}
```

**Workflow:**
1. Generator bikin kode FastAPI dari spec
2. Reviewer review kode yang digenerate (security, style, correctness)
3. Tester bikin test untuk kode + run test
4. Orchestrator aggregate semua hasil

### Latihan 2: Flow Diagram

Buat ASCII flow diagram untuk workflow yang kamu buat. Contoh:

```
┌─────────────┐
│ Orchestrator │
└──────┬──────┘
       │
   ┌───┴───┬───────────┐
   ▼       ▼           ▼
┌──────┐┌──────┐  ┌────────┐
│ Gen  ││Review│  │ Tester │
└──┬───┘└──┬───┘  └───┬────┘
   │       │          │
   └───────┴──────────┘
           ▼
    ┌─────────────┐
    │ Aggregated  │
    │   Result    │
    └─────────────┘
```

### Delivery
- Simpan orchestrator script di `53-ai-coding-agents/labs/orchestrator.py`
- Flow diagram di `53-ai-coding-agents/labs/flow-diagram.txt`
- Test dengan spec calculator API

---

## Key Takeaways

1. **Orchestrator + Worker** adalah pattern fundamental multi-agent
2. **Role-based agents** — assign expertise, bukan generic
3. **Tools delegation** — setiap agent punya tool akses berbeda
4. **Context isolation** — need-to-know basis, jangan overload worker
5. **Parallel vs sequential** — bedakan independent vs dependent tasks
6. **Error handling** — retry, recovery, fallback strategy
7. **Result aggregation** — orchestrator yang gabung, bukan worker
