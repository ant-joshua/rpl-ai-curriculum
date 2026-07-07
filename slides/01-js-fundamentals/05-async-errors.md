---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/7325498/pexels-ph"
footer: "Sesi 05: Async Errors"
---

<!-- _class: title -->
# 1.5 Async, Error Handling & Fetch

## Error Handling

```javascript
function bagi(a, b) {
  try {
    if (b === 0) throw new Error("Ga bisa bagi dengan 0");
    return a / b;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}
```

## Async/Await

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("Mulai...");
  await delay(2000);
  console.log("2 detik kemudian...");
}
```

## Fetch API

```javascript
async function getJoke() {
  try {
    const response = await fetch("https://official-joke-api.appspot.com/random_joke");
    const data = await response.json();
    console.log(`${data.setup}`);
    console.log(`${data.punchline}`);
  } catch (error) {
    console.error("Gagal ambil data:", error.message);
  }
}
getJoke();
```

## Debug Challenge

Cari & fix bug:

```javascript
// Bug 1: infinite loop
function countDown(n) {
  while (n > 0) {
    console.log(n);
  }
}

// Bug 2: NaN
function average(arr) {
  let total = 0;
  for (let i = 0; i <= arr.length; i++) {
    total += arr[i];
  }
  return total / arr.length;
}

// Bug 3: undefined name
const user = { name: "Budi", greet: () => console.log(`Halo ${this.name}`) };
user.greet();
```

## Latihan Akhir

1. Fetch dari public API (cuaca / berita / crypto) - tampilkan rapi
2. Handle error kalo API down atau network error
3. Gabungin semua konsep: function + array + object + async + error handling
