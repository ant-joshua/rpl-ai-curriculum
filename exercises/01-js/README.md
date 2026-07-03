# 🏋️ Latihan JavaScript

## 1. Variable & Operator

```typescript
function celsiusToFahrenheit(celsius: number): number {
  // === KODE LO DISINI ===
}
console.log(celsiusToFahrenheit(30)); // 86
```

## 2. Conditional

```typescript
function getGrade(nilai: number): string {
  // >= 90: A, >= 80: B, >= 70: C, >= 60: D, < 60: E
  // === KODE LO DISINI ===
}
console.log(getGrade(85)); // "B"
```

## 3. Loops

```typescript
function printStar(n: number): void {
  // Cetak pola:
  // *
  // **
  // ***
  // ****
  // *****
  // === KODE LO DISINI ===
}
```

## 4. Array Methods

```typescript
const products = [
  { name: "Nasi", price: 5000 },
  { name: "Telur", price: 2500 },
  { name: "Kopi", price: 15000 },
  { name: "Roti", price: 12000 },
];

function expensiveProducts(items: typeof products) {
  // Filter yang > 10000
  // === KODE LO DISINI ===
}

function totalPrice(items: typeof products): number {
  // Hitung total pake reduce
  // === KODE LO DISINI ===
}
```

## 5. Fetch & Async

```typescript
async function getQuote(): Promise<string> {
  const url = "https://api.quotable.io/random";
  // Fetch + try/catch
  // === KODE LO DISINI ===
}
getQuote().then(console.log);
```
