# 1.5 Async, Error Handling & Fetch API

JavaScript itu **single-threaded** — cuma bisa ngelakuin satu hal dalam satu waktu. Tapi pake **async**, bisa nunggu tanpa ngeblock.

## Callback Hell — Cara Lama (HINDARI!)

```javascript
// Dulu orang nulis gini — mengerikan!
getUser(1, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      console.log(comments);
      // Callback hell — susah dibaca, susah di-debug
    });
  });
});
```

## Promise — Janji

Promise = object yang nampilin **nilai di masa depan** (belum ada sekarang, tapi bakal ada).

```javascript
// Membuat Promise
const janji = new Promise((resolve, reject) => {
  const sukses = true;
  
  setTimeout(() => {
    if (sukses) {
      resolve("Janji ditepati! ✅");
    } else {
      reject("Janji diingkari! ❌");
    }
  }, 2000);
});

// Menggunakan Promise
console.log("Mulai...");

janji
  .then((result) => console.log(result))    // Success handler
  .catch((error) => console.error(error))   // Error handler
  .finally(() => console.log("Selesai"));   // Always runs

console.log("Lanjut..."); // Ini jalan duluan!
```

**Promise States:**
1. **Pending** — belum selesai
2. **Fulfilled** — sukses (resolve)
3. **Rejected** — gagal (reject)

### Promise Methods Berguna

```javascript
// Promise.all — jalanin semua paralel, nunggu semua selesai
const p1 = fetch("https://api.1.com");
const p2 = fetch("https://api.2.com");
const p3 = fetch("https://api.3.com");

Promise.all([p1, p2, p3])
  .then(responses => console.log("Semua selesai"))
  .catch(err => console.error("Satu aja gagal, semua gagal"));

// Promise.allSettled — jalanin semua, dapet hasil masing-masing
Promise.allSettled([p1, p2, p3])
  .then(results => {
    results.forEach(r => {
      if (r.status === "fulfilled") console.log("OK:", r.value);
      if (r.status === "rejected") console.log("FAIL:", r.reason);
    });
  });

// Promise.race — siapa paling cepet dialah pemenang
Promise.race([p1, p2])
  .then(first => console.log("Yang pertama selesai:", first));

// Promise.any — ambil yang pertama sukses
Promise.any([p1, p2, p3])
  .then(firstSuccess => console.log("Yang pertama OK:", firstSuccess));
```

## Async/Await — Cara Modern (WAJIB!)

Async/await = **syntactic sugar** di atas Promise. Kode keliatan sync padahal async.

```javascript
// Function async selalu return Promise
async function getData() {
  return "data";
}
console.log(getData()); // Promise {<fulfilled>: "data"}

// Await — nunggu Promise selesai
async function main() {
  console.log("Mulai...");
  
  const result = await getData();
  console.log(result); // "data"
  
  console.log("Selesai");
}
main();
```

### Async/Await vs Promise.then

```javascript
// Promise.then
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(err => console.error(err));

// Async/Await (lebih bersih!)
async function displayComments(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    console.error("Gagal:", error);
  }
}
```

### Paralel dengan Async/Await

```javascript
// Sequential (lambat — nunggu satu-satu)
async function getDataSlow() {
  const user = await fetchUser(1);         // 1 detik
  const products = await fetchProducts();   // 1 detik
  const orders = await fetchOrders();       // 1 detik
  // Total: 3 detik
}

// Paralel (cepat — jalan barengan)
async function getDataFast() {
  const [user, products, orders] = await Promise.all([
    fetchUser(1),         // 1 detik
    fetchProducts(),      // 1 detik (barengan)
    fetchOrders()         // 1 detik (barengan)
  ]);
  // Total: 1 detik!
}
```

## Fetch API — Ngomong sama Server

```javascript
// GET request
async function getUser(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// POST request
async function createPost(data) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Package fetch jadi service
const api = {
  baseURL: "https://jsonplaceholder.typicode.com",
  
  async get(endpoint) {
    const res = await fetch(`${this.baseURL}${endpoint}`);
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  
  async post(endpoint, data) {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
    return res.json();
  }
};

// Pake!
async function demo() {
  try {
    const users = await api.get("/users");
    const newPost = await api.post("/posts", { title: "Test", body: "Content" });
    console.log(users.length, "users loaded");
  } catch (err) {
    console.error("API error:", err);
  }
}
```

## Error Handling Lengkap

```javascript
async function fetchData(url) {
  // 1. Validasi input
  if (!url) throw new Error("URL diperlukan");
  
  // 2. Timeout — kalo server lemot
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 detik max
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    
    // 3. Cek HTTP status
    if (!response.ok) {
      switch (response.status) {
        case 400: throw new Error("Bad request — cek input lo");
        case 401: throw new Error("Unauthorized — login dulu");
        case 403: throw new Error("Forbidden — ga punya akses");
        case 404: throw new Error("Not found — URL salah");
        case 500: throw new Error("Server error — coba lagi nanti");
        default: throw new Error(`HTTP ${response.status}`);
      }
    }
    
    return await response.json();
    
  } catch (error) {
    // 4. Bedain jenis error
    if (error.name === "AbortError") {
      throw new Error("Request timeout — server lemot");
    }
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error — cek koneksi internet lo");
    }
    throw error; // Re-throw kalo udah dihandle
  } finally {
    clearTimeout(timeout);
  }
}
```

## Real Project: Async Data Pipeline

```javascript
// Pipeline: ambil data → proses → simpan
async function dataPipeline() {
  try {
    // 1. Fetch data dari 3 sumber paralel
    const [users, posts, todos] = await Promise.all([
      fetchData("https://jsonplaceholder.typicode.com/users"),
      fetchData("https://jsonplaceholder.typicode.com/posts"),
      fetchData("https://jsonplaceholder.typicode.com/todos"),
    ]);
    
    // 2. Proses — join data
    const report = users.map(user => {
      const userPosts = posts.filter(p => p.userId === user.id);
      const userTodos = todos.filter(t => t.userId === user.id);
      
      return {
        name: user.name,
        email: user.email,
        company: user.company.name,
        postCount: userPosts.length,
        completedTodos: userTodos.filter(t => t.completed).length,
        completionRate: `${(userTodos.filter(t => t.completed).length / userTodos.length * 100).toFixed(0)}%`
      };
    });
    
    // 3. Output
    console.table(report);
    return report;
    
  } catch (error) {
    console.error("Pipeline failed:", error.message);
    throw error;
  }
}
```

## Latihan

1. **Fake API dengan setTimeout**
   ```javascript
   function delay(ms) {
     return new Promise(resolve => setTimeout(resolve, ms));
   }
   
   async function hitungMundur(detik) {
     for (let i = detik; i >= 0; i--) {
       console.log(i);
       await delay(1000);
     }
     console.log("🎉 Waktunya!");
   }
   hitungMundur(5);
   ```

2. **Fetch Public API**
   Coba fetch dari:
   - https://api.coindesk.com/v1/bpi/currentprice.json (Bitcoin price)
   - https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&current_weather=true (cuaca)
   - https://official-joke-api.appspot.com/random_joke (joke)
   
   Tampilkan data dengan format rapi.

3. **Retry Logic**
   ```javascript
   async function fetchWithRetry(url, maxRetries = 3) {
     for (let i = 1; i <= maxRetries; i++) {
       try {
         const response = await fetch(url);
         if (!response.ok) throw new Error(`HTTP ${response.status}`);
         return await response.json();
       } catch (error) {
         console.log(`Percobaan ${i} gagal: ${error.message}`);
         if (i === maxRetries) throw new Error("Semua percobaan gagal");
         await delay(1000 * i); // Exponential backoff
       }
     }
   }
   ```

4. **Async Data Dashboard**
   Fetch users + posts + comments dari JSONPlaceholder.
   Buat laporan: User dengan post terbanyak, user dengan comment terbanyak, rata-rata comment per post, top 3 most commented posts.

5. **Debug Challenge** — Cari & fix bug:
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
   
   // Bug 4: promise ga jalan
   async function getData() {
     const data = fetch("https://api.example.com/data");
     console.log(data); // ?
   }
   
   // Bug 5: error swallowed
   async function risky() {
     try {
       throw new Error("Something wrong");
     } catch (e) {
       // Kosong — error ilang!
     }
   }
   ```

6. **Mini Project: CLI Loading Animation**
   ```javascript
   async function loadingAnimation(detik, text = "Loading") {
     const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
     const endTime = Date.now() + detik * 1000;
     let i = 0;
     
     while (Date.now() < endTime) {
       process.stdout.write(`\r${frames[i % frames.length]} ${text}...`);
       await delay(100);
       i++;
     }
     process.stdout.write("\r✅ Selesai!           \n");
   }
   
   // Catatan: pake process.stdout hanya jalan di Node.js, bukan browser
   ```
