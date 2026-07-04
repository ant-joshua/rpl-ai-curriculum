# 🏋️ Latihan TypeScript

## Level 1: Dasar

### 1. Type Inference & Annotations

```typescript
// Ubah kode JS ini ke TS dengan tipe yang tepat
let nama = "Budi";
let umur = 17;
let isAktif = true;
let hobi = ["coding", "gaming", "membaca"];

// === KODE LO DISINI ===
// Tambahin type annotations!

function sapa(nama) {
  return `Halo, ${nama}!`;
}
```

**Expected:** `sapa("Rina")` ngasi `"Halo, Rina!"`. Kalo dipanggil pake number, error.

### 2. Union & Literal Types

```typescript
// Bikin fungsi yang validasi status pemesanan
// Status cuma bisa: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

function getStatusBadgeColor(status: OrderStatus): string {
  // pending -> "yellow"
  // processing -> "blue"
  // shipped -> "purple"
  // delivered -> "green"
  // cancelled -> "red"
  // === KODE LO DISINI ===
}

console.log(getStatusBadgeColor("pending"));   // "yellow"
console.log(getStatusBadgeColor("delivered")); // "green"
// getStatusBadgeColor("unknown"); // Harusnya ERROR
```

### 3. Interface Dasar

```typescript
// Bikin interface User dengan: id (string), name (string), email (string), age? (optional number)
interface User {
  // === KODE LO DISINI ===
}

// Bikin fungsi yang nerima User dan return string profile
function formatUser(user: User): string {
  // === KODE LO DISINI ===
  // Return: "Budi (budi@email.com) — 17 tahun"
  // Kalo age undefined: "Budi (budi@email.com)"
}

const user1: User = { id: "u1", name: "Budi", email: "budi@email.com", age: 17 };
const user2: User = { id: "u2", name: "Siti", email: "siti@email.com" };

console.log(formatUser(user1)); // "Budi (budi@email.com) — 17 tahun"
console.log(formatUser(user2)); // "Siti (siti@email.com)"
```

## Level 2: Intermediate

### 4. Interface Extension & Nested Objects

```typescript
interface Address {
  street: string;
  city: string;
  postalCode: string;
}

// Extend User dari soal 3 — tambah properti address: Address
interface UserWithAddress extends User {
  // === KODE LO DISINI ===
}

// Bikin fungsi yang return string alamat lengkap
function getFullAddress(user: UserWithAddress): string {
  // === KODE LO DISINI ===
  // Return: "Jl. Merdeka No.1, Jakarta, 10110"
}

const user3: UserWithAddress = {
  id: "u3",
  name: "Andi",
  email: "andi@email.com",
  address: { street: "Jl. Merdeka No.1", city: "Jakarta", postalCode: "10110" },
};

console.log(getFullAddress(user3));
```

### 5. Generic Function

```typescript
// Bikin generic function getProperty yang amanin akses properti object
// Kalo property ga ada, return default value

function getProperty<T, K extends keyof T>(obj: T, key: K, defaultValue: T[K]): T[K] {
  // === KODE LO DISINI ===
  // Return obj[key] kalo ada, else defaultValue
}

const siswa = { nama: "Budi", umur: 17, kelas: "XII RPL" };
console.log(getProperty(siswa, "nama", "Anonymous")); // "Budi"
console.log(getProperty(siswa, "kelas", "X"));        // "XII RPL"
```

### 6. Generic Interface — ApiResponse

```typescript
// Bikin generic interface ApiResponse<T>
interface ApiResponse<T> {
  success: boolean;
  // === KODE LO DISINI ===
  // Tambah: data (tipe T), message (string), statusCode (number)
}

// Bikin fungsi fetchUsers yang return Promise<ApiResponse<User[]>>
interface User { id: string; name: string; email: string; }

async function fetchUsers(): Promise<ApiResponse<User[]>> {
  // Mock: return response sukses dengan 2 user
  // === KODE LO DISINI ===
  // Return: { success: true, data: [...], message: "OK", statusCode: 200 }
}

fetchUsers().then((res) => {
  // res.data[0].name harusnya auto-complete sebagai string
  // === KODE LO DISINI ===
  // Coba akses res.data[0].name — TypeScript harus tau tipenya
});
```

### 7. Function Overload

```typescript
// Bikin overloaded function formatInput:
// - Kalo input string: return string huruf kapital
// - Kalo input number: return string "Rp X.XXX" (pake toLocaleString)
// - Kalo input Date: return string "DD/MM/YYYY"

function formatInput(input: string): string;
function formatInput(input: number): string;
function formatInput(input: Date): string;
function formatInput(input: string | number | Date): string {
  // === KODE LO DISINI ===
}

console.log(formatInput("hello"));      // "HELLO"
console.log(formatInput(15000));        // "Rp 15.000"
console.log(formatInput(new Date(2025, 0, 15))); // "15/01/2025"
```

## Level 3: Challenge

### 8. Utility Types & Partial/Pick/Omit

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

// 8a. Partial — update project (field optional, cuma yang dikirim yg diubah)
function updateProject(id: string, updates: Partial<Project>): Project {
  // Mock: return project yg udah di-merge
  // === KODE LO DISINI ===
  // const existing: Project = { id: "p1", name: "Old", ... };
  // return { ...existing, ...updates };
}

// 8b. Pick — bikin preview object dari Project (cuma id, name, status)
type ProjectPreview = Pick<Project, "id" | "name" | "status">;

function getProjectPreview(project: Project): ProjectPreview {
  // === KODE LO DISINI ===
}

// 8c. Omit — bikin tipe tanpa properti timestamp
type ProjectWithoutTimestamps = Omit<Project, "createdAt" | "updatedAt">;

// Test
const proj: Project = {
  id: "p1", name: "Website", description: "Landing page",
  status: "active", createdAt: new Date(), updatedAt: new Date(), ownerId: "u1",
};
console.log(updateProject("p1", { name: "Website v2" }));
console.log(getProjectPreview(proj));
// ^ cuma { id, name, status }
```

### 9. Generic Constraints — Entity Repository

```typescript
// Bikin generic repository pattern sederhana
// Semua entity harus punya id: string

interface BaseEntity {
  id: string;
}

class Repository<T extends BaseEntity> {
  private items: T[] = [];

  findById(id: string): T | undefined {
    // === KODE LO DISINI ===
  }

  findAll(): T[] {
    // === KODE LO DISINI ===
  }

  create(item: T): T {
    // === KODE LO DISINI ===
    // Push item, return item
  }

  deleteById(id: string): boolean {
    // === KODE LO DISINI ===
    // Hapus item dengan id cocok, return true kalo ketemu
  }
}

// Test
interface Product extends BaseEntity {
  name: string;
  price: number;
}

const repo = new Repository<Product>();
repo.create({ id: "p1", name: "Laptop", price: 15000000 });
repo.create({ id: "p2", name: "Mouse", price: 250000 });

console.log(repo.findById("p1"));  // Product object
console.log(repo.findAll().length); // 2
console.log(repo.deleteById("p2")); // true
console.log(repo.findAll().length); // 1
```

### 10. JS ke TS — Refactor Challenge

```typescript
// Refactor kode JS ini ke TypeScript yang proper
// Perbaiki SEMUA masalah: missing types, any, unsafe access, dll

// === KODE JS ASAL (REFACTOR KE TS) ===
// const data = [
//   { id: 1, name: "Budi", scores: [80, 90, 85] },
//   { id: 2, name: "Andi", scores: [75, 88] },
//   { id: 3, name: "Siti" },
// ];
//
// function getAverage(scores) {
//   return scores.reduce((a, b) => a + b, 0) / scores.length;
// }
//
// function processStudentData(data) {
//   return data.map((student) => ({
//     ...student,
//     average: getAverage(student.scores),
//     grade: student.average >= 90 ? "A" : student.average >= 80 ? "B" : "C",
//   }));
// }

// === KODE TS LO DISINI (tulis ulang dengan type safety penuh) ===
// Hint: 
// - Bikin interface Student
// - scores optional? StudentWithoutScores?
// - Guard against undefined scores
// - Fix the bug: student.average accessed BEFORE it's assigned
```
