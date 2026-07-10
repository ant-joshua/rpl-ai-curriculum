# 26. Palindrome Checker 💀

**Level:** Sulit  
**Topik:** String Manipulation & Logic

## 🎯 Learning Objective
Membuat algoritma pengecekan palindrome (dibaca sama dari depan dan belakang).

## 📝 Problem
Buat fungsi `isPalindrome(str)` yang mengembalikan `true` jika string adalah palindrome, `false` jika bukan. Abaikan case dan spasi.

## 🧪 Starter Code

```javascript
function isPalindrome(str) {
  // Bersihkan string: lowercase & hapus spasi
  // Balikkan string
  // Bandingkan
}

console.log(isPalindrome("katak"));
console.log(isPalindrome("Kasur ini rusak"));
console.log(isPalindrome("A man a plan a canal Panama"));
console.log(isPalindrome("javascript"));
console.log(isPalindrome("ibu ratna antar ubi"));
```

## ✅ Expected Output

```
true
true
true
false
true
```

## 💡 Hint
Gunakan `str.toLowerCase().replace(/\s/g, "")` untuk membersihkan string. Balikkan dengan `.split("").reverse().join("")`.

<details>
<summary>Klik untuk lihat solusi</summary>

```javascript
function isPalindrome(str) {
  let bersih = str.toLowerCase().replace(/\s/g, "");
  let terbalik = bersih.split("").reverse().join("");
  return bersih === terbalik;
}

console.log(isPalindrome("katak"));
console.log(isPalindrome("Kasur ini rusak"));
console.log(isPalindrome("A man a plan a canal Panama"));
console.log(isPalindrome("javascript"));
console.log(isPalindrome("ibu ratna antar ubi"));
```
</details>
