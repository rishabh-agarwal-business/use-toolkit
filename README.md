# ⚡ @use-toolkit/core

> Production-grade React hooks for modern applications
> Lightweight • Type-safe • Built for real-world complexity

---

## 🧠 Why this exists

Most React hook libraries are either:

- ❌ Too basic (toy examples)
- ❌ Too heavy (bloated APIs, large bundle size)

This library is built for:

👉 Real-world apps
👉 Performance-sensitive systems
👉 Developers who want control

---

## ✨ What you get

### 📡 Data Layer

- `useQueryLite` → caching, deduplication, retries, SWR
- `useMutationLite` → optimistic updates, invalidation

### 🌐 Real-Time

- `useWebSocketAdvanced`

  - auto reconnect
  - exponential backoff
  - message queue (offline-safe)
  - heartbeat

### 📶 Network Awareness

- `useNetworkState` → online/offline + connection quality

### 🧠 State

- `useUndoRedo` → time-travel state
- `useStateMachine` _(coming soon)_

### 💾 Storage

- `useLocalStorageSync` → TTL + cross-tab sync
- `useIndexedDB` _(coming soon)_

### 👀 Observability

- `useIntersectionObserverAdvanced` → lazy loading
- `useRenderTracker` → debug re-renders

### ⚡ Performance (coming soon)

- `useIdleCallback`
- `useVirtualizedList`

---

## 📦 Installation

```bash
npm install @use-toolkit/core
```

---

## ⚙️ Requirements

- React `^18 || ^19`
- TypeScript (recommended)

---

## 🚀 Quick Start

### 1️⃣ Data Fetching

```tsx
import { useQueryLite } from "@use-toolkit/core";

function Products() {
  const { data, isLoading } = useQueryLite(["products"], async (signal) => {
    const res = await fetch("/api/products", { signal });
    return res.json();
  });

  if (isLoading) return <p>Loading...</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

---

### 2️⃣ Mutation (Optimistic UI)

```tsx
import { useMutationLite } from "@use-toolkit/core";

const { mutate } = useMutationLite(
  async (data) => fetch("/api", { method: "POST", body: JSON.stringify(data) }),
  {
    invalidateQueries: [["products"]],
  }
);
```

---

### 3️⃣ WebSocket (Real-Time)

```tsx
import { useWebSocketAdvanced } from "@use-toolkit/core";

const { send, readyState } = useWebSocketAdvanced("wss://api.example.com");

send({ type: "message", text: "Hello" });
```

---

### 4️⃣ Network Awareness

```tsx
import { useNetworkState } from "@use-toolkit/core";

const { isSlow } = useNetworkState();

const image = isSlow ? lowRes : highRes;
```

---

### 5️⃣ Undo / Redo

```tsx
import { useUndoRedo } from "@use-toolkit/core";

const { state, setState, undo } = useUndoRedo({ text: "" });
```

---

### 6️⃣ Persistent Storage

```tsx
import { useLocalStorageSync } from "@use-toolkit/core";

const { value, setValue } = useLocalStorageSync("counter", 0);
```

---

### 7️⃣ Lazy Loading

```tsx
import { useIntersectionObserverAdvanced } from "@use-toolkit/core";

const { ref, isIntersecting } = useIntersectionObserverAdvanced();

return <img ref={ref} src={isIntersecting ? "/img.jpg" : undefined} />;
```

---

### 8️⃣ Render Debugging

```tsx
import { useRenderTracker } from "@use-toolkit/core";

const { renderCount } = useRenderTracker({ name: "Component" });
```

---

## ⚡ Key Advantages

- ✅ Zero dependencies
- ✅ Fully typed (no `any`)
- ✅ Memory-safe (cleanup handled)
- ✅ Production-ready APIs
- ✅ Works with React 18 & 19

---

## 📊 Bundle Size

- ~25KB (unminified)
- Tree-shakeable

---

## 🛣️ Roadmap

- 🔜 DevTools panel (Chrome extension)
- 🔜 IndexedDB hook
- 🔜 Virtualized list
- 🔜 State machine
- 🔜 Idle tasks

---

## 🤝 Contributing

PRs and ideas are welcome!

---

## 📄 License

MIT

---

## 👨‍💻 Author

Rishabh Agarwal

---

## ⭐ Support

If this helped you, consider giving it a ⭐ on GitHub
