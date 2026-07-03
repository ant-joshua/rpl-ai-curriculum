# 2.2 Arrays & Hash Tables

Dua struktur data paling sering dipake. 90% problem LeetCode pake ini.

## Array

```typescript
const arr: number[] = [1, 2, 3, 4, 5];
```

| Operasi | Big O | Catatan |
|---------|-------|--------|
| Access (arr[i]) | O(1) | Langsung ke index |
| Search (cari nilai) | O(n) | Kalo ga tau indexnya |
| Push (tambah di akhir) | O(1) | Umumnya |
| Insert/Delete di awal | O(n) | Geser semua index! |
| Insert/Delete di akhir | O(1) | Kalo array dynamic |

## Hash Table (Map / Object / Set)

```typescript
// Object
const user: Record<string, any> = { nama: "Budi", umur: 17 };

// Map (lebih proper)
const scores = new Map<string, number>([
  ["Budi", 85],
  ["Andi", 90],
]);

// Set (unique values)
const unique = new Set([1, 2, 2, 3, 3, 3]);  // {1, 2, 3}
```

| Operasi | Big O | Catatan |
|---------|-------|--------|
| Access by key | O(1) | Langsung ke key |
| Insert | O(1) | |
| Delete | O(1) | |
| Search key | O(1) | Cepet banget |

## Array vs Hash Table — Kapan Pake yang Mana?

| Array | Hash Table |
|-------|------------|
| Butuh urutan | Ga peduli urutan |
| Butuh akses index | Butuh akses KEY (nama/ID) |
| Iterasi semua item | Cek keberadaan item |
| Memory efficient | Lebih boros memory |

## Pattern Penting

### Two Pointers (Array)

```typescript
function isPalindrome(str: string): boolean {
  let left = 0;
  let right = str.length - 1;
  
  while (left < right) {
    if (str[left] !== str[right]) return false;
    left++;
    right--;
  }
  return true;
}
// Big O: O(n), Space: O(1)
```

### Frequency Counter (Hash Table)

```typescript
function areAnagrams(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false;
  
  const freq = new Map<string, number>();
  
  for (const char of s1) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  
  for (const char of s2) {
    const count = freq.get(char);
    if (!count) return false;
    freq.set(char, count - 1);
  }
  
  return true;
}
// Big O: O(n), Space: O(n)
```

### Sliding Window (Array)

```typescript
function maxSubarraySum(arr: number[], k: number): number {
  let maxSum = 0;
  let windowSum = 0;
  
  // Inisialisasi window pertama
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Geser window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}
// Big O: O(n), Space: O(1)
```

## LeetCode Problems

| Problem | Pattern | Difficulty |
|---------|---------|------------|
| [Two Sum](https://leetcode.com/problems/two-sum) | Hash Map | Easy |
| [Contains Duplicate](https://leetcode.com/problems/contains-duplicate) | Set | Easy |
| [Valid Anagram](https://leetcode.com/problems/valid-anagram) | Frequency Counter | Easy |
| [Group Anagrams](https://leetcode.com/problems/group-anagrams) | Hash Map | Medium |
| [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self) | Prefix/Suffix | Medium |

## Latihan

1. Implement `containsDuplicate` pake Set (larangan nested loop)
2. Implement `twoSum` pake Map (O(n), bukan O(n²))
3. Implement `maxSubarraySum` sliding window
4. Cek anagram pake frequency counter
