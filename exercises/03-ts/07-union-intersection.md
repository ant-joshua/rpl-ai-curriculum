# TypeScript — Exercise #7: Union & Intersection Types

> **Level:** Intermediate
> **Topics:** union types, intersection types, literal types, discriminated unions

## Instructions

Gunakan union dan intersection types untuk:

1. `Status` — literal union type: `"active" | "inactive" | "pending"`.
2. `AdminUser` — intersection dari `User` (`{ id, name, email }`) dan `{ role: "admin", permissions: string[] }`.
3. `ApiState` — discriminated union: `{ status: "loading" } | { status: "success", data: T } | { status: "error", message: string }`.
4. `getStatusColor(status)` — function yang return warna berdasarkan status union.

## Starter Code

```javascript
// Gunakan union literal
// type Status = ...

const currentStatus = "active";

// Intersection: AdminUser = User & { role: "admin", permissions: string[] }
// type User = { id: number; name: string; email: string }

function createAdminUser(id, name, email) {
  // TODO: return object dengan tipe AdminUser
  return {
    id, name, email,
    role: "admin",
    permissions: ["read", "write", "delete"]
  };
}

function getStatusColor(status) {
  // TODO: "active" -> "green", "inactive" -> "gray", "pending" -> "yellow"
}

function handleApiState(state) {
  // TODO: handle discriminated union
  // loading -> return "Memuat..."
  // success -> return "Data: " + JSON.stringify(data)
  // error -> return "Error: " + message
}

const admin = createAdminUser(1, "Admin", "admin@test.com");
console.log(admin.role);
console.log(admin.permissions);

console.log(getStatusColor("active"));
console.log(getStatusColor("inactive"));
console.log(getStatusColor("pending"));

console.log(handleApiState({ status: "loading" }));
console.log(handleApiState({ status: "success", data: { name: "Budi" } }));
console.log(handleApiState({ status: "error", message: "Server error" }));
```

## Expected Output

```
admin
[ 'read', 'write', 'delete' ]
green
gray
yellow
Memuat...
Data: {"name":"Budi"}
Error: Server error
```

## Test Cases

```javascript
const a = createAdminUser(1, "A", "a@t.com");
console.log(a.role === "admin");                        // true
console.log(a.permissions.includes("delete"));          // true

console.log(getStatusColor("active") === "green");      // true
console.log(getStatusColor("inactive") === "gray");     // true
console.log(getStatusColor("pending") === "yellow");    // true

console.log(handleApiState({ status: "loading" }).includes("Memuat"));      // true
console.log(handleApiState({ status: "success", data: 42 }).includes("42")); // true
```
