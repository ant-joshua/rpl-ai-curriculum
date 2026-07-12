# TypeScript — Exercise #5: Utility Types

> **Level:** Intermediate
> **Topics:** Partial, Required, Pick, Omit, Record, ReturnType, Parameters

## Instructions

Gunakan TypeScript utility types untuk transformasi tipe:

1. `updateTodo(todo, updates)` — gunakan `Partial<Todo>` untuk update sebagian field.
2. `TodoPreview` — gunakan `Pick<Todo, 'title' | 'completed'>` untuk preview.
3. `PublicUser` — gunakan `Omit<User, 'password'>` untuk menghapus field sensitif.
4. `RolePermissions` — gunakan `Record<UserRole, string[]>` untuk mapping role ke permissions.
5. `createUserWrapper(...)` — gunakan `Parameters` dan `ReturnType` untuk type-safe wrapper.

## Starter Code

```javascript
// Data types
const todoDefaults = {
  title: "",
  description: "",
  completed: false,
  createdAt: new Date()
};

function updateTodo(todo, updates) {
  return { ...todo, ...updates };
}

const permissions = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"]
};

function createUser(name, age) {
  return { id: Math.random(), name, age, createdAt: new Date() };
}

// Test
const todo = { title: "Belajar TS", description: "Utility types", completed: false, createdAt: new Date() };
console.log(updateTodo(todo, { completed: true }));
console.log(updateTodo(todo, { title: "Belajar JavaScript" }));

console.log(Object.keys(permissions));
console.log(createUser("Budi", 17));
```

## Expected Output

```
{ title: 'Belajar TS', description: 'Utility types', completed: true, createdAt: ... }
{ title: 'Belajar JavaScript', description: 'Utility types', completed: false, createdAt: ... }
[ 'admin', 'editor', 'viewer' ]
{ id: ..., name: 'Budi', age: 17, createdAt: ... }
```

## Test Cases

```javascript
const t1 = { title: "a", description: "b", completed: false, createdAt: new Date() };
const u1 = updateTodo(t1, { completed: true });
console.log(u1.completed === true);          // true
console.log(u1.title === "a");               // true

const u2 = updateTodo(t1, {});
console.log(u2.completed === false);         // true (unchanged)

console.log(permissions.admin.length === 3);  // true
console.log(permissions.viewer.length === 1); // true
```
