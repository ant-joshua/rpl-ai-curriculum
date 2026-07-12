# Git — Exercise #3: Merge & Rebase

> **Level:** Intermediate
> **Topics:** git merge, git rebase, fast-forward, merge commit, conflict resolution

## Instructions

Praktikkan merge dan rebase, pahami perbedaannya.

Bagian 1: Fast-forward merge.
Bagian 2: Merge dengan --no-ff.
Bagian 3: Rebase untuk linear history.
Bagian 4: Conflict resolution.

## Starter Code

```bash
# === Setup ===
mkdir latihan-merge && cd latihan-merge
git init
echo "A" > file.txt && git add file.txt && git commit -m "A"
echo "B" >> file.txt && git add file.txt && git commit -m "B"
echo "C" >> file.txt && git add file.txt && git commit -m "C"

# Buat branch fitur
git checkout -b fitur
echo "X" >> file.txt && git add file.txt && git commit -m "X"
echo "Y" >> file.txt && git add file.txt && git commit -m "Y"

# Kembali ke main
git checkout main

# === Bagian 1: Fast-forward merge ===
git merge fitur
cat file.txt  # A, B, C, X, Y

# === Bagian 2: Merge dengan --no-ff ===
git checkout -b fitur2
echo "Z" >> file.txt && git commit -am "Z"
git checkout main
git merge --no-ff fitur2 -m "merge: fitur2 dengan no-ff"
git log --oneline --graph

# === Bagian 3: Rebase ===
mkdir latihan-rebase && cd latihan-rebase
git init
echo "base" > file.txt && git add file.txt && git commit -m "base"

git checkout -b fitur
echo "fitur1" >> file.txt && git add file.txt && git commit -m "fitur 1"
echo "fitur2" >> file.txt && git add file.txt && git commit -m "fitur 2"

git checkout main
echo "main1" >> file.txt && git add file.txt && git commit -m "main commit 1"
echo "main2" >> file.txt && git add file.txt && git commit -m "main commit 2"

git checkout fitur
git rebase main
git log --oneline
```

## Expected Output

```
$ git log --oneline (setelah rebase)
a1b2c3 fitur 2
d4e5f6 fitur 1
g7h8i9 main commit 2
j0k1l2 main commit 1
m3n4o5 base
```

## Test Cases

```bash
# Setelah merge fast-forward
cat file.txt | wc -l  # harus 5

# Setelah rebase, commit fitur di atas commit main
git log --oneline | head -n 1 | grep "fitur"
```
