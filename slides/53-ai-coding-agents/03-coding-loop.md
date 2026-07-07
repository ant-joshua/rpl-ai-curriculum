---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Module 53: AI Coding Agents & Workflow"
footer: "Sesi 03: Coding Loop"
---

<!-- _class: title -->
# Session 03: AI Coding Loop

> **Level:** Advanced  
> **Duration:** 2–3 hours  
> **Objective:** Kuasai AI Coding Loop — plan → code → test → review → refactor. Efisiensi loop, skip redundant steps, combine where possible.

---

## 1. The AI Coding Loop

```
    ┌────────────────────────────────────┐
    │           AI CODING LOOP            │
    │                                      │
    │    ┌─────────┐                      │
    │    │  PLAN   │ ◄── spec/analysis    │
    │    └────┬────┘                      │
    │         ▼                           │
    │    ┌─────────┐                      │
    │    │  CODE   │ ◄── generate/review  │
    │    └────┬────┘                      │
    │         ▼                           │
    │    ┌─────────┐                      │
    │    │  TEST   │ ◄── AI generate test │
    │    └────┬────┘                      │
    │         ▼                           │
    │    ┌──────────┐                     │
    │    │  REVIEW  │ ◄── security/style  │
    │    └────┬─────┘                     │
    │         ▼                           │
    │    ┌──────────┐                     │
    │    │ REFACTOR │ ◄── code smell fix  │
    │    └────┬─────┘                     │
    │         │                           │
    │         └──► (loop or done)         │
    └────────────────────────────────────┘
```

Setiap iterasi makin mendekati production-ready code.

---

## 2. Plan: Spec → Analysis → Task Breakdown

### Input: Product Spec / Feature Request

```markdown
## Feature: File Upload with Preview

User can upload image files (jpg, png, webp) up to 5MB.
System generates thumbnail preview (200x200).
Supported files: images only.
Storage: local filesystem (for now).
```

### AI Analysis

Prompt AI untuk breakdown:

```
Analyze this spec and produce:
1. Acceptance criteria (list of pass/fail conditions)
2. Technical tasks breakdown
3. Dependencies and risks
4. Estimated complexity (low/medium/high)

Spec: {spec}
```

### Output: Task Breakdown

```markdown
## Acceptance Criteria
- [ ] User can select file via button or drag-drop
- [ ] Only image files accepted (jpg, png, webp)
- [ ] File size limited to 5MB
- [ ] Thumbnail preview shown after upload
- [ ] Error shown for invalid files
- [ ] Progress indicator during upload

## Technical Tasks
1. Create FileUpload component (React/TS)
2. Create file validation utility
3. Create API endpoint POST /api/upload
4. Create thumbnail generation service (Pillow)
5. Create preview component
6. Add error handling + loading states

## Dependencies
- Pillow library for thumbnail generation
- File size validation on client + server
- CORS if frontend separate from backend

## Complexity
Overall: Medium
Frontend: Low
Backend: Medium
```

### Template: Plan Prompt

```
Task: {feature_spec}

Sebagai AI Coding Agent, buat:

1. **Acceptance Criteria** — minimal 5 criteria, pass/fail format
2. **Task Breakdown** — frontend + backend tasks, dependency graph
3. **Risk Analysis** — potential issues + mitigations
4. **Technical Decisions** — framework choice, library, architecture

Format: Markdown checklist dengan code blocks untuk code structure.
JANGAN generate implementasi — cukup plan.
```

---

## 3. Code: Generate → Review → Refine

### Generate with AI

```python

---

# Prompt untuk generate
prompt = f"""
Implementation task: {task}
Acceptance criteria: {criteria}
Tech stack: {tech_stack}
Existing code structure: {existing_code}

Generate implementation that:
1. Meets all acceptance criteria
2. Follows {project_standards} conventions
3. Includes error handling
4. Is production-ready

Return complete file contents with file paths.
"""
```

### Iterative Refinement

```python

---

# Iteration 1: First generation
code_v1 = generate_code(prompt)


---

# Iteration 2: Review and refine
review_feedback = review_code(code_v1)
code_v2 = refine_code(code_v1, review_feedback)


---

# Iteration 3: Edge cases
edge_cases = analyze_edge_cases(code_v2)
code_v3 = refine_code(code_v2, edge_cases)
```

### Prompt Iteration Strategy

| Iteration | Focus | Example Prompt |
|-----------|-------|----------------|
| v1 | Happy path | "Generate the main implementation" |
| v2 | Error handling | "Add error handling for edge cases" |
| v3 | Performance | "Optimize for large inputs" |
| v4 | Security | "Add security validation" |
| v5 | Polish | "Clean up, add comments, type hints" |

### Template: Code Generation Prompt

```
Task: {specific_task}
Tech stack: {language, framework, libraries}
Acceptance criteria:
{criteria}

Constraints:
- {constraint_1}
- {constraint_2}

Generate complete implementation with:
1. All required files
2. Error handling
3. Type hints (if applicable)
4. Docstrings/comments for complex logic
5. Usage example
```

---

## 4. Test: AI Generate Test = Test Prompt

### TDD with AI

```
RED (tulis test dulu) → GREEN (AI generate code) → REFACTOR

1. RED: AI generate test dari spec (sebelum ada code)
2. GREEN: AI generate code yang pass test
3. REFACTOR: AI refactor code + pastikan test masih pass
```

### Test Prompt Template

```
Generate comprehensive tests for the following code:

```python
{pasted_code}
```

Requirements:
- Cover all acceptance criteria
- Include edge cases (empty input, null, overflow, etc.)
- Include error cases (invalid input, permission, network error)
- Achieve >80% code coverage

For each test provide:
1. Test name
2. Description of scenario being tested
3. Test code
4. Expected result

Format: pytest style, organized in classes by feature.
```

### Test Quality Checklist

| Aspect | Check |
|--------|-------|
| **Covers acceptance criteria** | Every AC has at least 1 test |
| **Edge cases** | Empty, null, boundary values |
| **Error cases** | Invalid input, timeout, auth failure |
| **Coverage** | Line coverage >80% |
| **Readability** | Clear test names, descriptive assertions |
| **Isolation** | No test depends on another test |

### Running Tests in Loop

```python
import subprocess
import json

def run_tests_and_report():
    """Run pytest and return structured results."""
    result = subprocess.run(
        ["pytest", "--json-report", "--cov=.", "-v"],
        capture_output=True, text=True
    )

    report = json.loads(result.stdout)
    failures = [t for t in report["tests"] if t["outcome"] == "failed"]

    return {
        "passed": report["summary"]["passed"],
        "failed": report["summary"]["failed"],
        "coverage": report.get("coverage", {}).get("total", 0),
        "failures": failures,
        "duration": report["summary"]["duration"]
    }
```

---

## 5. Review: AI Code Review Checklist

### Security Scan

```python
security_checklist = """
[ ] SQL injection — parameterized queries?
[ ] XSS — output escaped?
[ ] CSRF — tokens present?
[ ] Auth — correct permission checks?
[ ] Data validation — input sanitized?
[ ] Secrets — hardcoded passwords/tokens?
[ ] File upload — path traversal safe?
[ ] Rate limiting — brute force protection?
"""
```

### Style Check

```python
style_checklist = """
[ ] Follows language conventions (PEP8, ESLint, etc.)
[ ] Consistent naming (snake_case/camelCase)
[ ] No dead code / commented-out code
[ ] Proper indentation
[ ] Line length within limits
[ ] Imports sorted and clean
[ ] Function/method length reasonable (<50 lines)
"""
```

### Architecture Check

```python
architecture_checklist = """
[ ] Single Responsibility Principle
[ ] DRY (Don't Repeat Yourself)
[ ] Proper separation of concerns
[ ] Error handling at appropriate level
[ ] Logging for debugging
[ ] Configuration externalized
[ ] API design consistent (RESTful)
[ ] Database queries optimized
"""
```

### AI Review Prompt

```
Review the following code changes:

```diff
{diff_content}
```

Evaluate against:
1. Security vulnerabilities (HIGH priority)
2. Code style and conventions
3. Architecture and design patterns
4. Performance implications
5. Potential bugs

For each issue found:
- Severity: HIGH / MEDIUM / LOW
- Location: file:line
- Description
- Suggested fix

Return as structured JSON:
```json
{
  "issues": [
    {"severity": "HIGH", "file": "src/main.py", "line": 42,
     "description": "...", "suggestion": "..."}
  ],
  "summary": {"high": 2, "medium": 3, "low": 1},
  "approved": false
}
```
```

---

## 6. Refactor: AI Identify Code Smell

### Common Code Smells AI Can Detect

| Smell | AI Prompt |
|-------|-----------|
| **Long function** | "Identify functions >30 lines that can be split" |
| **Duplicate code** | "Find duplicate code blocks >5 lines" |
| **Magic numbers** | "Find hardcoded numeric values" |
| **Deep nesting** | "Find blocks with >3 levels of nesting" |
| **Large class** | "Identify classes with >10 methods or >300 lines" |
| **God object** | "Find classes that do too many different things" |

### Refactor Prompt

```
Analyze this code for refactoring opportunities:

```python
{code}
```

For each opportunity:
1. Type of code smell
2. Current code location (file:line)
3. Refactored code suggestion
4. Expected benefit (readability, performance, maintainability)

Prioritize by impact:
- HIGH: affects correctness or performance
- MEDIUM: improves maintainability
- LOW: minor style improvement

Return refactored version of the full file.
```

### Example: AI-Initiated Refactor

```python

---

# BEFORE — AI identifies: repeated try/except pattern
def read_user(id):
    try:
        return db.query(User).get(id)
    except Exception as e:
        logger.error(f"Failed to read user {id}: {e}")
        raise

def read_product(id):
    try:
        return db.query(Product).get(id)
    except Exception as e:
        logger.error(f"Failed to read product {id}: {e}")
        raise


---

# AFTER — AI suggests decorator pattern
def db_operation(logger):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"DB operation failed: {e}")
                raise
        return wrapper
    return decorator

@db_operation(logger)
def read_user(id):
    return db.query(User).get(id)

@db_operation(logger)
def read_product(id):
    return db.query(Product).get(id)
```

---

## 7. Loop Efficiency

### When to Skip Steps

| Scenario | Skip | Reason |
|----------|------|--------|
| Simple function | Test + Review | Overhead > benefit |
| Boilerplate code | Plan | Clear from context |
| Prototype/PoC | Refactor | Not production-bound |
| Bug fix | Plan | Root cause already known |
| Config change | Code + Test + Review + Refactor | Just change config directly |

### When to Combine Steps

| Combination | When |
|-------------|------|
| **Code + Test** | Simple module — generate code and test together |
| **Review + Refactor** | Small changes — review findings langsung di-refactor |
| **Plan + Code** | Well-understood task — plan implicit in code prompt |
| **Test + Review** | Test coverage review + code review simultaneous |

### Full Loop Time Estimates

| Complexity | Plan | Code | Test | Review | Refactor | Total |
|------------|------|------|------|--------|----------|-------|
| Simple | 2 min | 3 min | 2 min | 1 min | — | ~8 min |
| Medium | 5 min | 10 min | 5 min | 3 min | 3 min | ~26 min |
| Complex | 15 min | 30 min | 15 min | 10 min | 10 min | ~80 min |

### Loop Efficiency Tips

1. **Stop when "good enough"** — perfect is enemy of done
2. **Fail fast** — skip review if tests fail, langsung fix
3. **Batch review** — review multiple files at once
4. **Test isolation** — run only affected tests, not full suite
5. **Use AI for what AI is good at** — generation + review, not architecture
6. **Human in the loop** — important decisions (architecture, security) need human

---

## 8. Complete Loop Example

```python
#!/usr/bin/env python3
"""AI Coding Loop — full implementation."""

import subprocess
import json
from typing import Dict, Any

class AICodingLoop:
    def __init__(self, ai_model="claude"):
        self.model = ai_model
        self.iteration = 0
        self.results = []

    def plan(self, spec: str) -> Dict[str, Any]:
        """Phase 1: Plan — breakdown spec into tasks."""
        prompt = f"Breakdown this spec into acceptance criteria + tasks:\n\n{spec}"
        # In real implementation: call LLM API
        return {"tasks": ["task_1", "task_2"], "criteria": ["c1", "c2"]}

    def code(self, task: str, criteria: list) -> str:
        """Phase 2: Code — generate implementation."""
        self.iteration += 1
        prompt = f"Task: {task}\nCriteria: {criteria}\nGenerate implementation."
        # In real implementation: call LLM API
        return f"# Generated code for: {task}"

    def test(self, code: str) -> Dict[str, Any]:
        """Phase 3: Test — generate and run tests."""
        # Generate test
        test_prompt = f"Generate pytest for:\n{code}"
        # Run test
        result = subprocess.run(
            ["pytest", "-v", "--tb=short"],
            capture_output=True, text=True
        )
        return {
            "passed": result.returncode == 0,
            "output": result.stdout,
            "errors": result.stderr
        }

    def review(self, code: str) -> Dict[str, Any]:
        """Phase 4: Review — security + style check."""
        prompt = f"Review code:\n{code}"
        return {
            "issues": [],
            "approved": True,
            "suggestions": []
        }

    def refactor(self, code: str, suggestions: list) -> str:
        """Phase 5: Refactor — apply improvements."""
        prompt = f"Refactor this code:\n{code}\nSuggestions:\n{suggestions}"
        return f"# Refactored: {code}"

    def run_loop(self, spec: str, max_iterations: int = 3) -> Dict[str, Any]:
        """Run AI Coding Loop for specified iterations."""
        print(f"=== AI Coding Loop: Iteration {self.iteration + 1} ===")

        # Plan
        plan_result = self.plan(spec)
        print(f"[Plan] {len(plan_result['tasks'])} tasks identified")

        all_results = []
        for i in range(max_iterations):
            print(f"\n--- Iteration {i + 1} ---")

            for task in plan_result['tasks']:
                # Code
                code = self.code(task, plan_result['criteria'])
                print(f"[Code] {task}: {len(code)} chars generated")

                # Test
                test_result = self.test(code)
                print(f"[Test] Passed: {test_result['passed']}")

                if not test_result['passed']:
                    print("[Test] FAILED — fixing...")
                    code = self.code(f"Fix: {test_result['errors']}",
                                     plan_result['criteria'])
                    continue

                # Review
                review_result = self.review(code)
                print(f"[Review] Issues: {len(review_result['issues'])}")

                # Refactor
                code = self.refactor(code, review_result['suggestions'])
                print(f"[Refactor] Applied {len(review_result['suggestions'])} suggestions")

                all_results.append({
                    "iteration": i,
                    "task": task,
                    "code": code,
                    "tests": test_result,
                    "review": review_result
                })

        return {"iterations": max_iterations, "results": all_results}



---

# ===== Usage =====
if __name__ == "__main__":
    loop = AICodingLoop()
    spec = """
    Feature: User registration API
    - POST /api/register with email + password
    - Email format validation
    - Password min 8 chars
    - Return JWT token
    """
    result = loop.run_loop(spec, max_iterations=3)
    print(json.dumps(result, indent=2))
```

---

## 9. Latihan

### Latihan: 3 Loop Iteration on a Feature

Pilih satu fitur berikut:

**Option A: To-Do List API**
```
- GET /todos — list semua todos
- POST /todos — create todo (title, priority)
- PATCH /todos/:id — update status
- DELETE /todos/:id — delete todo
```

**Option B: URL Shortener**
```
- POST /shorten — create short URL
- GET /:code — redirect to original
- GET /:code/stats — view click count
```

**Option C: (kamu tentukan sendiri)**

### Iterasi 1:
1. **Plan** — acceptance criteria + task breakdown (file: `PLAN.md`)
2. **Code** — generate implementasi lengkap (1 file atau lebih)
3. **Test** — generate test untuk kode iterasi 1
4. **Review** — review kode iterasi 1, catat issues

### Iterasi 2:
1. Fix issues dari review iterasi 1
2. Add error handling + edge cases
3. Update test
4. Review lagi

### Iterasi 3:
1. Add security (input validation, rate limiting, etc.)
2. Add logging
3. Refactor code smells
4. Final review

### Output per Iterasi

Simpan di folder `53-ai-coding-agents/labs/loop/`:

```
labs/loop/
├── iteration-01/
│   ├── code.py           # Generated code
│   ├── test_code.py      # Generated tests
│   ├── review.md         # Review report
│   └── PLAN.md           # Plan document
├── iteration-02/
│   ├── code.py
│   ├── test_code.py
│   └── review.md
└── iteration-03/
    ├── code.py
    ├── test_code.py
    └── review.md
```

### Checklist Delivery

- [ ] Plan document lengkap dengan acceptance criteria
- [ ] Code generation untuk setiap iterasi
- [ ] Test generation (minimal 5 test per iterasi)
- [ ] Review report dengan issues + suggestions
- [ ] Refactor di iterasi 3
- [ ] Dokumentasi perbedaan antar iterasi

---

## Key Takeaways

1. **Loop is not optional** — even AI-generated code needs plan → test → review
2. **Start small** — iterasi 1: happy path only, iterasi 2: edge cases, iterasi 3: polish
3. **Test first (TDD)** — AI generate test from spec before code
4. **Review security always** — AI can miss security vulnerabilities
5. **Know when to stop** — not every task needs full loop
6. **Combine steps** — reduce overhead for simple tasks
7. **Document iterations** — track improvement across loops
