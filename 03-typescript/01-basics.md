# 3.1 Tipe Dasar TypeScript

## Kenapa TypeScript?

TypeScript nambahin **static types** ke JavaScript. Error ketangkep pas ngetik, bukan pas jalan.

```typescript
// JavaScript — error baru kelihatan pas runtime
function add(a, b) { return a + b; }
console.log(add("5", 10)); // "510" — bug!

// TypeScript — error langsung kelihatan di editor
function add(a: number, b: number): number { return a + b; }
console.log(add("5", 10)); // ERROR: Argument of type 'string' not assignable
```

## Tipe Data Dasar

```typescript
let nama: string = "Budi";
let umur: number = 17;
let isActive: boolean = true;
let sesuatu: any = "bebas";  // Hindari — matiin type checking
let kosong: null = null;
let belumDiisi: undefined = undefined;
```

## Type Inference

TypeScript otomatis nebak tipe dari value.

```typescript
let nama = "Budi";       // TypeScript tau ini string
let umur = 17;           // number
let isActive = true;     // boolean

// nama = 42;  // ERROR: Type 'number' not assignable to type 'string'
```

## Array & Tuple

```typescript
// Array
let angka: number[] = [1, 2, 3];
let nama: Array<string> = ["Budi", "Andi"]; // syntax alternatif

// Tuple — array dengan panjang & tipe tetap
let siswa: [string, number] = ["Budi", 17];
// siswa = [17, "Budi"]; // ERROR: urutan salah
```

## Union Types

Variable bisa punya lebih dari satu tipe.

```typescript
let id: string | number;
id = "ABC123"; // OK
id = 123;      // OK
// id = true;  // ERROR

function display(value: string | number): string {
  return `Value: ${value}`;
}
```

## Literal Types

Batasin value ke nilai tertentu, bukan cuma tipe.

```typescript
let warna: "merah" | "hijau" | "biru";
warna = "merah";  // OK
// warna = "kuning"; // ERROR

type Status = "pending" | "success" | "error";
let status: Status = "pending";
```

## Type Aliases

Bikin nama kustom buat tipe.

```typescript
type ID = string | number;
type Point = { x: number; y: number };

let userId: ID = "user_001";
let pos: Point = { x: 10, y: 20 };
```

## Latihan

1. Bikin variable dengan tipe string, number, boolean, dan array of numbers. Coba assign value yang salah — lihat error TypeScript
2. Bikin fungsi `formatInput` yang nerima `string | number` dan return string berisi `"Input: <value>"`
3. Bikin type alias `UserId` (string | number) dan `StudentStatus` ("active" | "inactive" | "graduated")
4. Bikin tuple `[string, number, boolean]` buat representasi data siswa (nama, umur, isActive). Coba akses tiap element dan lihat tipenya
