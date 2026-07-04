# Quiz: Advanced AI Development Workflow

<div class="quiz">

**1. Event apa yang memicu AI code review pipeline di GitHub Actions?**

- [ ] `push` ke branch main
- [x] `pull_request` dengan types `[opened, synchronize, reopened]`
- [ ] `schedule` setiap jam
- [ ] `workflow_dispatch` manual

**2. Apa tiga langkah dalam siklus AI TDD (Test-Driven Development dengan AI)?**

- [ ] Plan → Code → Deploy
- [x] RED (generate test, fail) → GREEN (generate code, pass) → REFACTOR (perbaiki kode & test)
- [ ] Code → Review → Refactor
- [ ] Design → Implement → Test

**3. Apa yang dimaksud dengan quality gates dalam pipeline pengembangan?**

- [ ] Gerbang masuk ke kantor
- [x] Checkpoint otomatis yang memastikan kode memenuhi standar kualitas sebelum lanjut ke stage berikutnya
- [ ] Tools untuk desain UI
- [ ] Metode untuk estimasi deadline

**4. Tools apa yang digunakan untuk security scanning otomatis dalam pipeline?**

- [ ] Hanya ESLint
- [x] OWASP ZAP, Snyk, atau Trivy untuk mendeteksi kerentanan keamanan
- [ ] Prettier
- [ ] Node.js

**5. Manakah contoh AI-assisted refactoring yang tepat?**

- [x] AI memindahkan kode dari monolithic ke arsitektur modular, memisahkan concerns, dan mengupdate imports secara otomatis
- [ ] AI menulis ulang semua kode dari awal
- [ ] AI hanya mengganti nama variabel
- [ ] AI menghapus semua komentar

**6. Severity level mana yang harus memblokir merge dalam AI code review?**

- [ ] SUGGESTION
- [ ] MINOR
- [ ] MAJOR
- [x] CRITICAL — blocking, must fix sebelum merge

</div>
