# 🧠 Cheatsheet: Team Git Workflow

> Referensi cepet — 1 halaman.

## Topik Utama

| Sesi | Topik | Output |
|------|-------|--------|
| 1 | Branching Strategy | GitFlow/GitHub Flow/Trunk-based, branch naming, Conventional Commits |
| 2 | Pull Request Workflow | PR lifecycle, code review, merge strategies, CODEOWNERS |
| 3 | Conflict Resolution | Merge conflict types, VS Code Merge Editor, rebase, cherry-pick |
| 4 | GitHub Actions & Project Mgmt | CI/CD YAML, matrix build, Project boards, issue/PR templates |

## Command / Sintaks Penting

**Branch naming convention:**
```
<type>/<deskripsi-kebab-case>
```
| Prefix | Contoh |
|--------|--------|
| `feature/` | `feature/login-page` |
| `fix/` | `fix/navbar-overflow` |
| `hotfix/` | `hotfix/payment-gateway-down` |
| `chore/` | `chore/update-deps` |
| `docs/` | `docs/api-readme` |
| `release/` | `release/v1.2.0` |

**Conventional Commits:**
```
<type>(<scope>): <description>
```
- `feat: add login page`
- `feat(auth): add OAuth Google provider`
- `fix: handle empty order list`
- `fix(api): return 401 on expired token`
- `chore(deps): upgrade express to v5`
- `BREAKING CHANGE: migrate to new auth flow`

**Merge strategies:**
| Strategy | Command | Kapan |
|----------|---------|-------|
| Merge commit | `git merge --no-ff feature/a` | Tim besar, riwayat lengkap |
| Squash merge | `git merge --squash feature/a` | Satu fitur = satu commit bersih |
| Rebase merge | `git rebase main && git checkout main && git merge feature/a` | Linear history, main stabil |

**Conflict resolution commands:**
```bash
git merge feature/login              # conflict detected
git merge --abort                    # cancel merge
git mergetool                        # launch VS Code Merge Editor
git rebase main                      # rebase instead of merge
git rebase --continue                # after resolving conflicts
git rebase --skip                    # skip this commit
git rebase --abort                   # abort rebase
git cherry-pick <commit-hash>        # pick specific commit
git revert <commit-hash>            # undo commit (safe, creates new commit)
git reset --hard HEAD~1             # undo local commit (unsafe!)
```

**GitHub Actions snippet (CI):**
```yaml
name: CI Pipeline
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node-version }} }
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## Tips & Trik
- **PR size:** target < 200 lines change. > 500 lines = red flag, split
- **Rebase often:** `git pull --rebase` before every push keeps history linear
- **Protected branches:** enable in GitHub Settings → Branches → require PR review + status checks
- **CODEOWNERS file:** `.github/CODEOWNERS` auto-assigns reviewers per file path
- **GitHub Project board:** connect issues/PRs, use automation columns (To Do → In Progress → Done)

## Common Mistakes
- ❌ `git push --force` on shared branches — use `--force-with-lease`
- ❌ Long-lived feature branches without rebasing — merge hell guaranteed
- ❌ One PR mixing refactor + feature + bugfix — impossible to review
- ❌ Merge without testing — always wait for CI green
- ❌ Commit messages like `fix bug` or `update` — useless later

## Link Cepat
- [Module README](.)
- [Quiz](quiz.md)
