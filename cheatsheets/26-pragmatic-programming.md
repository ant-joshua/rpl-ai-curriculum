# 26. 🧠 Pragmatic Programming

## DRY — Don't Repeat Yourself
```js
// ❌ DRY violation
function sapaAdi() { console.log("Halo Adi"); }
function sapaBudi() { console.log("Halo Budi"); }

// ✅ DRY
function sapa(nama) { console.log(`Halo ${nama}`); }
```

## YAGNI — You Ain't Gonna Need It
- ❌ "Nanti mungkin perlu fitur export PDF" → buat sekarang
- ✅ Buat fitur ketika **benar-benar** dibutuhkan
- YAGNI != "no planning" — bedakan planning dan premature implementation

## KISS — Keep It Simple, Stupid
```js
// ❌ Over-engineered
const getStatus = () => {
  return nilai >= 70 ? "Lulus" : nilai >= 50 ? "Remedial" : "Tidak Lulus";
};

// ✅ Simple
function getStatus(nilai) {
  if (nilai >= 70) return "Lulus";
  if (nilai >= 50) return "Remedial";
  return "Tidak Lulus";
}
```

## Principle of Least Astonishment
- Fungsi bernama `getUser()` harus mengembalikan user, bukan menghapus database
- Parameter urut intuitif: `(x, y)` bukan `(y, x)`
- Side effect harus eksplisit di nama fungsi

## Boy Scout Rule
> "Leave the code cleaner than you found it."

- Perbaiki typo saat lihat
- Refactor kecil yang jelas lebih baik
- Tambah comment jika logika rumit

## Error Handling
```js
// ❌ Silent fail
try { data = JSON.parse(input); } catch {}

// ✅ Proper error handling
try {
  data = JSON.parse(input);
} catch (err) {
  console.error("Invalid JSON:", err.message);
  throw new Error("Failed to parse input");
}
```

## Commenting
- **KOMENTARI "KENAPA"**, bukan "APA"
```js
// ❌ Useless
// Increment i by 1
i++;

// ✅ Useful: explain why, not what
// Gunakan while, bukan for, karena panjang array berubah
```

## Naming
| ❌ Buruk | ✅ Baik |
|----------|---------|
| `x` | `userCount` |
| `data` | `studentList` |
| `handleClick` | `handleSubmitClick` |
| `getIt` | `getUserById` |
| `tmp` | `tempBuffer` |

## Common Pitfalls
- ❌ Premature optimization — "premature optimization is the root of all evil"
- ❌ Copy-paste tanpa paham — pahami dulu baru pakai
- ❌ Over-abstraction — satu fungsi buat semuanya
- ❌ Magic numbers — pakai konstan dengan nama jelas

## Related Links
- [25 Soft Skills](25-soft-skills.md)
