# Node.js — Exercise #2: Path Module

> **Level:** Beginner
> **Topics:** path module, path.join, path.basename, path.extname, path.resolve

## Instructions

Gunakan `path` module untuk manipulasi path file.

1. `getFileInfo(filePath)` — return object dengan `{ name, ext, dir, base }`.
2. `joinPaths(...segments)` — gabung segmen path menggunakan `path.join`.
3. `isAbsolute(filePath)` — cek apakah path absolut (`path.isAbsolute`).
4. `resolveRelative(base, relative)` — resolve relative path terhadap base path.

## Starter Code

```javascript
const path = require('path');

function getFileInfo(filePath) {
  // TODO: return { name, ext, dir, base }
  // Gunakan path.basename, path.extname, path.dirname
}

function joinPaths(...segments) {
  // TODO: gabung path segments
}

function isAbsolute(filePath) {
  // TODO: cek apakah path absolut
}

function resolveRelative(base, relative) {
  // TODO: resolve relative path terhadap base
}

console.log(getFileInfo('/home/user/docs/file.txt'));
console.log(joinPaths('/home', 'user', 'docs', 'file.txt'));
console.log(isAbsolute('/home/user'));
console.log(isAbsolute('relative/path'));
console.log(resolveRelative('/home/user', 'docs/file.txt'));
```

## Expected Output

```
{ name: 'file', ext: '.txt', dir: '/home/user/docs', base: 'file.txt' }
/home/user/docs/file.txt
true
false
/home/user/docs/file.txt
```

## Test Cases

```javascript
console.log(getFileInfo('a/b/c.js').ext === '.js');     // true
console.log(getFileInfo('a/b/c.js').name === 'c');       // true
console.log(joinPaths('a', 'b', 'c') === 'a/b/c');       // true
console.log(isAbsolute('/test') === true);                // true
console.log(isAbsolute('test') === false);                // true
```
