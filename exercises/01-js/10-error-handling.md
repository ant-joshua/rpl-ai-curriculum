# JavaScript — Exercise #10: Error Handling

> **Level:** Intermediate
> **Topics:** try/catch, throw, Error object, custom errors

## Instructions

Buat fungsi-fungsi dengan penanganan error yang tepat:

1. `divide(a, b)` — membagi `a` dengan `b`. Lempar error jika `b === 0`.
2. `parseJSON(str)` — mengubah string JSON ke object. Gunakan try/catch, return `null` jika parsing gagal.
3. `validateAge(age)` — validasi umur: harus number, >= 0 dan <= 150. Lempar error dengan pesan spesifik.
4. `safeExecute(fn)` — wrapper yang menjalankan fungsi dan menangkap error, return `{ success, result, error }`.

## Starter Code

```javascript
function divide(a, b) {
  // TODO: throw error jika b === 0
}

function parseJSON(str) {
  // TODO: parse JSON, return null jika gagal
}

function validateAge(age) {
  // TODO: validasi age (number, range 0-150)
}

function safeExecute(fn) {
  // TODO: execute fn, return { success, result, error }
}

// Test divide
try {
  console.log(divide(10, 2));
  console.log(divide(10, 0));
} catch (e) {
  console.log("Error:", e.message);
}

// Test parseJSON
console.log(parseJSON('{"name":"Budi"}'));
console.log(parseJSON('invalid json'));

// Test validateAge
try {
  validateAge(25);
  console.log("Umur valid");
  validateAge(-5);
} catch (e) {
  console.log("Error:", e.message);
}

// Test safeExecute
console.log(safeExecute(() => 42));
console.log(safeExecute(() => { throw new Error("gagal"); }));
```

## Expected Output

```
5
Error: Pembagian dengan nol tidak diperbolehkan
{ name: 'Budi' }
null
Umur valid
Error: Umur harus >= 0
{ success: true, result: 42, error: null }
{ success: false, result: null, error: 'gagal' }
```

## Test Cases

```javascript
console.log(divide(15, 3) === 5);                     // true
console.log(parseJSON('{"a":1}').a === 1);            // true
console.log(parseJSON('invalid') === null);            // true

try { validateAge(200); } catch(e) {
  console.log(e.message.includes("150"));              // true
}

const r = safeExecute(() => "ok");
console.log(r.success === true && r.result === "ok");  // true
```
