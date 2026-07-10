# 04. 🖥️ Web Basics (DOM, Events, Fetch, Forms)

## DOM Selection
```js
document.getElementById("id")
document.querySelector(".class")       // elemen pertama
document.querySelectorAll("div")       // NodeList
document.getElementsByClassName("c")   // HTMLCollection
```

## DOM Manipulation
```js
el.textContent = "teks baru";          // ubah teks
el.innerHTML = "<strong>bold</strong>"; // ubah HTML (hati-hati XSS)
el.style.color = "blue";
el.classList.add("aktif");
el.classList.remove("aktif");
el.classList.toggle("aktif");
el.setAttribute("src", "foto.jpg");
```

## Events
```js
// addEventListener (recommended)
button.addEventListener("click", (e) => {
  console.log("Clicked!", e.target);
});

// Event types
click, dblclick, mouseover, mouseout
keydown, keyup, keypress
submit, change, input, focus, blur
load, DOMContentLoaded, scroll, resize

// Event object
e.target      // elemen yang memicu event
e.preventDefault()  // cegah default
e.stopPropagation() // hentikan bubbling
```

## Fetch API
```js
// GET
fetch("https://api.example.com/users")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// POST
fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nama: "Budi" })
});

// Async/Await
async function getUsers() {
  try {
    const res = await fetch("https://api.example.com/users");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) { console.error(err); }
}
```

## Forms
```html
<form id="myForm">
  <input type="text" name="nama" required>
  <input type="email" name="email">
  <button type="submit">Kirim</button>
</form>
```
```js
document.getElementById("myForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  console.log(formData.get("nama"));
  console.log(Object.fromEntries(formData));
});
```

## Element Creation
```js
const div = document.createElement("div");
div.textContent = "Hello";
document.body.appendChild(div);

// Template literal
document.body.innerHTML += `<p>Baru</p>`;
```

## Common Pitfalls
- ❌ Lupa `e.preventDefault()` pada form submit → page reload
- ❌ `innerHTML` dengan input user → XSS vulnerability
- ❌ DOMContentLoaded vs load — pilih yang sesuai
- ❌ `querySelectorAll` mengembalikan NodeList (bukan Array) — gunakan `Array.from()`

## Related Links
- [00 Fundamentals](00-fundamentals.md)
- [35 HTML CSS](35-html-css.md)
