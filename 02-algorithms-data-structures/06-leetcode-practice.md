# 2.6 LeetCode Practice — Dari Brute ke Optimal

## Cara Ngerjain LeetCode

**Step-by-step approach:**

1. **Pahamin problem** — contoh input/output, edge cases
2. **Brute force dulu** — yang penting jalan, ga mikir optimal
3. **Optimize** — dari O(n²) → O(n log n) → O(n)
4. **Write code** — pake TypeScript, run di LeetCode
5. **Test** — edge cases: empty, besar, negatif, duplicated

> "First, make it work. Then, make it fast."

## 10 Problem Progression

### Level 1: Easy (Foundation)

#### 1. Two Sum

```typescript
// Brute: O(n²) — nested loop
function twoSumBrute(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}

// Optimal: O(n) — pake Map
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
```

#### 2. Valid Parentheses

```typescript
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(', ']': '[', '}': '{',
  };
  
  for (const char of s) {
    if ('([{'.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) return false;
    }
  }
  
  return stack.length === 0;
}
```

#### 3. Palindrome Number

```typescript
function isPalindrome(x: number): boolean {
  if (x < 0) return false;
  if (x < 10) return true;
  if (x % 10 === 0) return false;  // 10, 20, 30...
  
  let reversed = 0;
  let original = x;
  
  while (original > reversed) {
    reversed = reversed * 10 + original % 10;
    original = Math.floor(original / 10);
  }
  
  return original === reversed || original === Math.floor(reversed / 10);
}
// O(log n) — ga perlu konversi ke string!
```

### Level 2: Easy-Medium

#### 4. Best Time to Buy and Sell Stock

```typescript
function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;  // beli di harga terendah
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;  // jual di harga tertinggi
    }
  }
  
  return maxProfit;
}
// O(n), Space: O(1)
```

#### 5. Maximum Subarray (Kadane's Algorithm)

```typescript
function maxSubArray(nums: number[]): number {
  let maxCurrent = nums[0];
  let maxGlobal = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    maxCurrent = Math.max(nums[i], maxCurrent + nums[i]);
    maxGlobal = Math.max(maxGlobal, maxCurrent);
  }
  
  return maxGlobal;
}
// O(n) — ini sering ditanya di interview!
```

#### 6. Contains Duplicate

```typescript
function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  
  return false;
}
// O(n) — jauh lebih cepet dari nested loop O(n²)
```

### Level 3: Medium

#### 7. Product of Array Except Self

```typescript
function productExceptSelf(nums: number[]): number[] {
  const result: number[] = new Array(nums.length).fill(1);
  
  // Prefix products
  let prefix = 1;
  for (let i = 0; i < nums.length; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  
  // Suffix products
  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  
  return result;
}
// O(n), Space: O(1) (result array ga diitung)
```

#### 8. Longest Substring Without Repeating Characters

```typescript
function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();
  let maxLen = 0;
  let left = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    
    if (seen.has(char) && seen.get(char)! >= left) {
      left = seen.get(char)! + 1;
    }
    
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}
// O(n) — sliding window + hash map
```

### Level 4: Challenge

#### 9. Three Sum

```typescript
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);  // O(n log n)
  const result: number[][] = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;  // skip duplicates
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}
// O(n²) — optimal untuk 3-sum
```

#### 10. Merge Intervals

```typescript
function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;
  
  intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      result.push(current);
    }
  }
  
  return result;
}
// O(n log n) — sorting dulu, merge linear
```

## Progress Tracker

| # | Problem | Difficulty | Brute | Optimal | Selesai |
|---|---------|------------|-------|---------|---------|
| 1 | Two Sum | Easy | O(n²) | O(n) | ☐ |
| 2 | Valid Parentheses | Easy | — | O(n) | ☐ |
| 3 | Palindrome Number | Easy | O(n) | O(log n) | ☐ |
| 4 | Best Time to Buy & Sell | Easy | O(n²) | O(n) | ☐ |
| 5 | Maximum Subarray | Easy | O(n²) | O(n) | ☐ |
| 6 | Contains Duplicate | Easy | O(n²) | O(n) | ☐ |
| 7 | Product Except Self | Medium | O(n²) | O(n) | ☐ |
| 8 | Longest Substring | Medium | O(n³) | O(n) | ☐ |
| 9 | Three Sum | Medium | O(n³) | O(n²) | ☐ |
| 10 | Merge Intervals | Medium | O(n²) | O(n log n) | ☐ |

## Tips Interview

1. **Jangan langsung optimal** — interviewer mau liat proses mikir lo
2. **Voice your thought** — "Ini O(n²) pake nested loop. Tapi bisa di-optimize pake hash map jadi O(n)"
3. **Handle edge cases** — empty, singular, negative, duplicate
4. **Test pake contoh** — "Kalo inputnya [], outputnya harus []"
---

**Next step:** Bikin akun LeetCode, mulai dari Two Sum, naik perlahan. Target: 1 problem per hari = 30 problem/bulan.
