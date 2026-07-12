# JavaScript — Exercise #9: Async Basics (Promise & Async/Await)

> **Level:** Intermediate
> **Topics:** Promise, async/await, setTimeout, Promise.all

## Instructions

Buat fungsi-fungsi asynchronous berikut:

1. `delay(ms)` — mengembalikan Promise yang resolve setelah `ms` milidetik.
2. `fetchUser(id)` — mengembalikan Promise yang resolve dengan object `{ id, name: "User " + id }`. Reject jika id < 1.
3. `getMultipleUsers(ids)` — menggunakan `Promise.all` untuk fetch multiple users secara paralel.
4. `runSequentially()` — menggunakan async/await untuk menjalankan beberapa operasi secara berurutan.

## Starter Code

```javascript
function delay(ms) {
  // TODO: buat Promise yang resolve setelah ms milidetik
}

function fetchUser(id) {
  // TODO: Promise yang resolve dengan { id, name }
  // reject kalau id < 1
}

async function getMultipleUsers(ids) {
  // TODO: fetch multiple users paralel pake Promise.all
}

async function runSequentially() {
  // TODO: jalankan delay(500) lalu fetchUser(1) lalu console.log
  console.log("Mulai...");
  await delay(500);
  console.log("Setelah delay 500ms");
  const user = await fetchUser(1);
  console.log("User:", user.name);
}

// Test
fetchUser(1).then(u => console.log("User 1:", u.name)).catch(e => console.error(e));
fetchUser(0).then(u => console.log(u)).catch(e => console.error("Error:", e.message));

getMultipleUsers([1, 2, 3]).then(users => {
  console.log("Multiple users:", users.map(u => u.name));
});

// Uncomment untuk test sequential:
// runSequentially();
```

## Expected Output

```
User 1: User 1
Error: ID harus >= 1
Multiple users: [ 'User 1', 'User 2', 'User 3' ]
```

## Test Cases

```javascript
delay(10).then(() => console.log("delay works"));       // "delay works"

fetchUser(5).then(u => {
  console.log(u.id === 5 && u.name === "User 5");       // true
});

fetchUser(-1).catch(e => {
  console.log(e.message === "ID harus >= 1");            // true
});
```
