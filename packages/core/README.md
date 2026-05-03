# ⚡ @use-toolkit/core

> Production-grade React hooks for modern applications  
> Lightweight. Type-safe. Built for real-world complexity.

---

## 🧠 Why this exists

Most React hook libraries are either:

- ❌ Too basic (toy examples)
- ❌ Too heavy (complex APIs, large bundle size)

This library is designed for:

👉 Real-world apps  
👉 Performance-sensitive systems  
👉 Developers who want control

---

## ✨ Features

### 📡 Data & Server State

- `useQueryLite` → data fetching with caching, deduplication, retry, stale-while-revalidate
- `useMutationLite` → mutations with optimistic updates and automatic cache invalidation

---

### 🌐 Real-Time & Networking

- `useWebSocketAdvanced`  
  → WebSocket with auto-reconnect, exponential backoff, message queueing, and heartbeat

- `useNetworkState`  
  → network status detection (online/offline), connection quality (4G/3G/2G), latency hints

---

### 🧠 State & History

- `useUndoRedo`  
  → undo/redo state management with full history tracking

- `useLocalStorageSync`  
  → persistent state with TTL (expiration) and cross-tab synchronization

---

### 👀 Observability & Performance

- `useIntersectionObserverAdvanced`  
  → advanced intersection observer with multi-element support and one-time triggers

- `useRenderTracker`  
  → development tool to detect unnecessary re-renders and track performance issues

---

## ⚙️ Installation

```bash
npm install @use-toolkit/core
```
