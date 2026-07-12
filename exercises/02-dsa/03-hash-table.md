# Algoritma & Struktur Data — Exercise #3: Hash Table (Anagram Check)

> **Level:** Beginner
> **Topics:** hash table, Map, frequency counter

## Instructions

Buat fungsi untuk mengecek apakah dua string adalah **anagram** (memiliki huruf yang sama dengan jumlah yang sama).

Selesaikan dengan tiga cara:

1. `isAnagramSort(s, t)` — urutkan kedua string, bandingkan.
2. `isAnagramMap(s, t)` — gunakan Map untuk menghitung frekuensi huruf.
3. `isAnagramArray(s, t)` — gunakan array 26 element (khusus huruf kecil a-z).

## Starter Code

```javascript
function isAnagramSort(s, t) {
  // TODO: sort dan bandingkan
}

function isAnagramMap(s, t) {
  // TODO: pake Map buat hitung frekuensi
}

function isAnagramArray(s, t) {
  // TODO: pake array 26 element (hanya huruf kecil)
}

// Test cases
console.log(isAnagramSort("anagram", "nagaram"));   // true
console.log(isAnagramMap("rat", "car"));             // false
console.log(isAnagramArray("listen", "silent"));     // true
console.log(isAnagramMap("hello", "world"));         // false
console.log(isAnagramMap("aacc", "ccac"));           // false
console.log(isAnagramSort("", ""));                   // true
```

## Expected Output

```
true
false
true
false
false
true
```

## Test Cases

```javascript
console.log(isAnagramMap("anagram", "nagaram") === true);   // true
console.log(isAnagramMap("rat", "car") === false);           // true
console.log(isAnagramMap("", "") === true);                  // true
console.log(isAnagramArray("listen", "silent") === true);    // true
console.log(isAnagramArray("hello", "world") === false);     // true
```
