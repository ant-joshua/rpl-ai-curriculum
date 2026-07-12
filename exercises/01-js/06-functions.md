# JavaScript — Exercise #6: Functions

> **Level:** Beginner
> **Topics:** function declaration, return vs void, parameters

## Instructions

Buat dua fungsi dengan perilaku berbeda:

1. `hitungDiskon(price, discountPercent)` — fungsi yang **mengembalikan** harga setelah diskon.
2. `cetakStruk(items, total)` — fungsi **void** yang mencetak struk belanja ke console.

Fungsi `cetakStruk` harus mencetak format:

```
=== STRUK BELANJA ===
1. item1
2. item2
Total: RpXXXXX
=== TERIMA KASIH ===
```

## Starter Code

```javascript
function hitungDiskon(price, discountPercent) {
  // TODO: return price setelah diskon
}

function cetakStruk(items, total) {
  // TODO: cetak struk belanja
}

console.log(hitungDiskon(50000, 20));
cetakStruk(["Nasi Goreng", "Es Teh", "Pisang Goreng"], 45000);
```

## Expected Output

```
40000
=== STRUK BELANJA ===
1. Nasi Goreng
2. Es Teh
3. Pisang Goreng
Total: Rp45000
=== TERIMA KASIH ===
```

## Test Cases

```javascript
console.log(hitungDiskon(100000, 10) === 90000);   // true
console.log(hitungDiskon(50000, 50) === 25000);    // true
console.log(hitungDiskon(20000, 0) === 20000);     // true
console.log(typeof cetakStruk(["a"], 1000));        // "undefined"
```
