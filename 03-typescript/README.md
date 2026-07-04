# 03. TypeScript Basics

> **Level:** 🌱 Beginner  
> **Jam:** 4 (2 minggu x 2 sesi)  
> **Prasyarat:** JavaScript Fundamentals  
> **Output:** Project JavaScript di-refactor ke TypeScript

## Kenapa TypeScript?

```typescript
// JavaScript - error baru kelihatan pas dijalanin
function add(a, b) { return a + b; }
console.log(add("5", 10)); // "510" - bug!

// TypeScript - error kelihatan pas ngetik
function add(a: number, b: number): number { return a + b; }
console.log(add("5", 10)); // ERROR!
```

## Tipe Dasar

```typescript
let nama: string = "Budi";
let umur: number = 17;
let isActive: boolean = true;
let random: any = "bebas";  // Hindari
```

## Interface

```typescript
interface Student {
  name: string;
  age: number;
  grade?: string;  // opsional
}

const student: Student = { name: "Budi", age: 17 };
```

## Latihan

1. Refactor semua project JS minggu 1-4 ke TypeScript
2. Bikin interface Student, Product, Order dan function-function-nya
