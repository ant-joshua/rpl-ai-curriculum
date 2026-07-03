# Ele: React Dasar

> **Level:** Intermediate  
> **Jam:** 6  
> **Prasyarat:** JavaScript Fundamentals, Web Basics

## Materi

| Sesi | Topik | Output |
|------|-------|--------|
| 1 | React intro, JSX, komponen | Hello React |
| 2 | Props, State, useState | Counter + form |
| 3 | useEffect, fetch data | Dashboard dari API |

## Contoh

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```
