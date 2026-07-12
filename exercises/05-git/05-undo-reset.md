# Git — Exercise #5: Undo & Reset

> **Level:** Beginner
> **Topics:** git revert, git reset, git restore, git stash, git clean

## Instructions

Praktikkan cara membatalkan perubahan di Git: revert, reset, stash, dan restore.

## Starter Code

```bash
# === Setup ===
mkdir latihan-undo && cd latihan-undo
git init
echo "line 1" > file.txt && git add file.txt && git commit -m "commit 1"
echo "line 2" >> file.txt && git add file.txt && git commit -m "commit 2"
echo "line 3" >> file.txt && git add file.txt && git commit -m "commit 3"
echo "line 4" >> file.txt && git add file.txt && git commit -m "commit 4"

# === Revert (aman — buat commit baru yang membatalkan) ===
git log --oneline
git revert HEAD~1 --no-edit  # revert commit 3
cat file.txt  # line 1, line 2, line 4

# === Reset soft ===
git reset --soft HEAD~1
git status  # file.txt masih di staging

# === Reset mixed (default) ===
git reset HEAD~1
git status  # file.txt modified, unstaged

# === Reset hard (HATI-HATI!) ===
git reset --hard HEAD~1
git status  # working directory bersih

# === Stash ===
echo "perubahan sementara" >> file.txt
git stash push -m "progress sementara"
git stash list
git stash pop

# === Restore ===
echo "perubahan baru" >> file.txt
git restore file.txt  # batalkan perubahan
```

## Expected Output

```
$ git revert HEAD~1 --no-edit
[main abc1234] Revert "commit 3"
 1 file changed, 1 deletion(-)

$ cat file.txt
line 1
line 2
line 4

$ git stash list
stash@{0}: On main: progress sementara
```

## Test Cases

```bash
# Setelah reset --hard, file.txt hanya berisi line 1
cat file.txt | wc -l  # harus 1

# Stash list harus kosong setelah pop
git stash list  # tidak ada output
```
