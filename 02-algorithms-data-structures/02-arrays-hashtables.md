# 2.2 Array & Hash Table

Array & Hash Table = struktur data **paling sering dipake**. 90% kode lo pake salah satu atau dua-duanya.

## Array — Jantung Data

### Array Statis vs Dinamis

| Array Statis | Array Dinamis (JS) |
|---|---|
| Ukuran tetap | Ukuran otomatis nambah |
| Lebih cepet | Agak lebih lambat (karena resize) |
| Kaya `int arr[10]` di Java/C | Kaya `[]` di JavaScript |
| Ga umum di JS | Default di JS |

Di JavaScript, **semua array = dinamis**. Gak perlu mikirin ukuran.

```typescript
// Operasi Array — Big O
const arr = [10, 20, 30, 40, 50];

// Akses index — O(1) INSTANT
console.log(arr[2]); // 30 — langsung, ga peduli panjang array

// Push/Pop — O(1) 🙏
arr.push(60);  // Tambah di akhir — cepat
arr.pop();     // Hapus di akhir — cepat

// Shift/Unshift — O(n) 😱
arr.shift();   // Hapus di awal — SLOW! Semua elemen geser
arr.unshift(5); // Tambah di awal — SLOW!
```

### Array Patterns Penting

```typescript
// 1. Two Pointer — nyari pasangan
function pairSum(sortedArr: number[], target: number): [number, number] | null {
  let left = 0;
  let right = sortedArr.length - 1;
  
  while (left < right) {
    const sum = sortedArr[left] + sortedArr[right];
    if (sum === target) return [sortedArr[left], sortedArr[right]];
    if (sum < target) left++;
    else right--;
  }
  return null;
}
console.log(pairSum([1, 2, 3, 4, 5, 6], 7)); // [1, 6] atau [2, 5] atau [3, 4]

// 2. Sliding Window — subarray berurutan
function maxSubarraySum(arr: number[], k: number): number {
  let windowSum = 0;
  let maxSum = 0;
  
  // Hitung window pertama
  for (let i = 0; i < k; i++) windowSum += arr[i];
  maxSum = windowSum;
  
  // Geser window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
console.log(maxSubarraySum([2, 4, 1, 6, 3, 8, 5], 3)); // 17 (6+3+8)

// 3. Prefix Sum — range sum cepet
function prefixSum(arr: number[]): number[] {
  const prefix = new Array(arr.length);
  prefix[0] = arr[0];
  for (let i = 1; i < arr.length; i++) {
    prefix[i] = prefix[i - 1] + arr[i];
  }
  return prefix;
}
// prefixSum[i] = jumlah arr[0] + ... + arr[i]
// Sum dari index a ke b = prefix[b] - prefix[a-1]
```

## Hash Table (Object/Map) — Cari Cepet

Hash Table = nyimpen data pake **key → value**. Cari data dalam **O(1)** — langsung dapet!

### Object vs Map di TypeScript

```typescript
// Object — simpel
const obj: Record<string, number> = { a: 1, b: 2 };
console.log(obj["a"]); // 1

// Map — lebih proper
const map = new Map<string, number>();
map.set("a", 1);
map.set("b", 2);
console.log(map.get("a"));  // 1
console.log(map.has("c"));  // false
console.log(map.size);      // 2

// Set — kumpulan unique values
const set = new Set([1, 2, 3, 1, 2, 3]);
console.log(set); // Set { 1, 2, 3 } — duplikat otomatis ilang!
```

### Kapan Pake What

```typescript
// pake objek kalo unique string keys & simple
// pake Map kalo butuh any type keys, frequent add/delete, size property
// pake Set kalo butuh nyimpen unique values

// Contoh: frequency counter (paling sering dipake)
function countFrequency(arr: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1;
  }
  return freq;
}

const votes = ["Budi", "Ani", "Budi", "Caca", "Ani", "Budi"];
console.log(countFrequency(votes));
// { Budi: 3, Ani: 2, Caca: 1 }
```

### Common Hash Table Patterns

```typescript
// 1. Two Sum — soal LeetCode NO.1!
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return [];
}
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1] — 2 + 7 = 9

// 2. Contains Duplicate
function hasDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}

// 3. Group Anagrams
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  
  for (const str of strs) {
    const sorted = str.split("").sort().join("");
    if (!groups.has(sorted)) groups.set(sorted, []);
    groups.get(sorted)!.push(str);
  }
  
  return Array.from(groups.values());
}
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]

// 4. First Non-Repeating Character
function firstUniqueChar(s: string): number {
  const freq = new Map<string, number>();
  
  for (const char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  
  for (let i = 0; i < s.length; i++) {
    if (freq.get(s[i]) === 1) return i;
  }
  return -1;
}
```

## Array vs Hash Table — Tradeoff

| Operasi | Array | Hash Table |
|---------|-------|------------|
| Cari by value | O(n) | O(1) 🏆 |
| Cari by index | O(1) 🏆 | - |
| Insert (akhir) | O(1) | O(1) |
| Insert (awal) | O(n) ❌ | O(1) 🏆 |
| Delete (value) | O(n) ❌ | O(1) 🏆 |
| Memory | ✅ Hemat | ❌ Lebih boros |
| Order | ✅ Terurut | ❌ Gak berurut |

> **Rule of thumb:** Butuh cari cepet? Pake Hash Table. Butuh data berurutan? Pake Array. Butuh dua-duanya? Pake dua-duanya!

## Latihan

1. **Remove Duplicates** — hapus duplikat dari array pake Set
2. **Intersection** — cari elemen yang ada di dua array
3. **Majority Element** — cari elemen yang muncul > n/2 kali
4. **Valid Anagram** — cek apakah dua string anagram
5. **Contains Duplicate II** — jarak maksimal k antara duplikat
6. **Top K Frequent** — cari K elemen paling sering muncul
7. **Product of Array Except Self** — kali semua elemen kecuali dirinya sendiri (tanpa pake division!)
