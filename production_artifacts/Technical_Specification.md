# Technical Specification — ChatWithMe
**Anonymous Gender-Preference Chat Application**
**Version**: 1.0.0 | **Status**: ✅ APPROVED | **Date**: 2026-09-28

---

## 1. Executive Summary

**ChatWithMe** is a privacy-first, real-time anonymous chat application that connects strangers based on mutual gender preferences. There are no accounts, no message history, and no personally identifiable information stored at any point. Users fill out a short preference form, enter a matchmaking queue, and are connected to a compatible stranger for a live one-on-one conversation.

**Core Value Proposition**: Omegle-style spontaneous connection with bidirectional gender-preference consent and a polished modern UI.

---

## 2. Functional Requirements

### 2.1 User Preference Collection
- A **6-step animated Stepper form** collects user preferences before matchmaking.
- Steps:
  1. **Welcome** — Introductory screen explaining the app.
  2. **Age** — Numeric input. Must be **18 or older** (client + server validated).
  3. **Your Gender** — Select: `Male | Female | Other`
  4. **Preferred Chat Partner Gender** — Select: `Male | Female | Any`
  5. **City** — Free-text input (optional, stored only in session memory).
  6. **Confirm & Start** — Summary + "Find a Stranger" button triggers `join_queue`.
- All inputs use React controlled components; state held in `App.jsx`.

### 2.2 Matchmaking
- Users who complete the form are placed into an **in-memory FIFO queue**.
- A match is found when **both users mutually satisfy each other's gender preference** (bidirectional check).
- On match:
  - A unique `roomId` is generated (`room_<timestamp>_<random>`).
  - Both sockets are joined to the Socket.IO room.
  - A `matched` event is emitted to both clients with the `roomId`.
- If no match is found immediately, the server emits `queue_waiting` and the client shows a loading/waiting screen.

### 2.3 Real-Time Chat
- After matching, both users are shown a **ChatWindow**.
- Messages are sent via `chat_message` Socket.IO event with `{ roomId, text }`.
- The server **relays** (does not store) messages to the other user in the room.
- Each message is rendered with a timestamp and styled differently for sender vs. receiver.
- System messages are displayed for events (e.g., *"Stranger has disconnected."*).

### 2.4 Session Termination
- Either user can click **"End Chat"** to disconnect from the session.
- On end/disconnect:
  - The partner receives a `partner_disconnected` event.
  - The Socket.IO room is destroyed.
  - All room state is purged from memory.
  - The user who ended the chat is returned to the preference form (or offered a "Find New Stranger" option).

### 2.5 Online Presence Counter
- A live **online user count** is displayed in the UI header at all times.
- The server broadcasts `online_count { count }` on every `connection` and `disconnect` event.
- Count represents total connected sockets (not just matched users).

---

## 3. Non-Functional Requirements

### 3.1 Privacy
| Requirement | Implementation |
|---|---|
| No accounts / login | Anonymous sockets only — no auth layer |
| No PII storage | Age, gender, city held in server memory for session duration only, purged on disconnect |
| No IP exposure | All messages relay through the server; no peer-to-peer connection |
| No message persistence | Messages are discarded after relay; no DB writes |
| Session destruction | All Maps cleared on `disconnect` event |

### 3.2 Latency
- Target message round-trip: **< 100ms** on local network.
- Socket.IO connection upgrade to WebSocket preferred; long-polling as fallback.

### 3.3 Scalability (Future)
- Current: Single-process, in-memory state.
- Future: **Redis Adapter** (`@socket.io/redis-adapter`) allows horizontal scaling across multiple Node.js instances.
- `waitingQueue`, `activeRooms`, `socketToRoom` Maps to be migrated to Redis hashes.

---

## 4. Architecture & Tech Stack

### 4.1 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.x |
| Build tool | Vite | 5.x |
| Animations | Motion (`motion/react`) | Latest |
| Real-time (client) | socket.io-client | 4.x |
| Backend runtime | Node.js | 18+ |
| HTTP server | Express | 4.x |
| Real-time (server) | socket.io | 4.x |
| Styling | Vanilla CSS (custom design system) | — |

---

## 5. Socket.IO Event Schema

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_queue` | Client → Server | `{ age, gender, preferredGender, city }` | User submits form and enters queue |
| `queue_waiting` | Server → Client | `{}` | No match found yet; show waiting UI |
| `matched` | Server → Client | `{ roomId: string }` | Match found; transition to chat |
| `chat_message` | Client → Server | `{ roomId: string, text: string }` | User sends a message |
| `chat_message` | Server → Client | `{ text: string, timestamp: number }` | Relayed message from partner |
| `end_chat` | Client → Server | `{}` | User voluntarily ends session |
| `partner_disconnected` | Server → Client | `{}` | Partner left or disconnected |
| `online_count` | Server → Client (broadcast) | `{ count: number }` | Live online user count update |

---

## 6. Matchmaking Algorithm

### 6.1 Bidirectional Gender Preference Check

```javascript
function isMatch(userA, userB) {
  const aLikesB = userA.preferredGender === 'any' || userA.preferredGender === userB.gender;
  const bLikesA = userB.preferredGender === 'any' || userB.preferredGender === userA.gender;
  return aLikesB && bLikesA;
}
```

### 6.2 Match Flow

1. User joins queue → added to `waitingQueue` Map (socketId → userData).
2. `tryMatch()` iterates all waiting pairs.
3. First valid pair found → room created → both removed from queue → sockets joined to room → `matched` emitted.
4. If no pair found → `queue_waiting` emitted to new user.
5. `tryMatch()` re-runs whenever a user leaves the queue.

### 6.3 Age Validation Rules
- **Client**: Stepper "Continue" button disabled unless age ≥ 18 and is a valid number.
- **Server**: `join_queue` handler rejects with `error` event if age < 18 or not a number.

---

## 7. Frontend Application State Machine

`App.jsx` manages a single `appState` that drives which screen is rendered:

```
'form'  ──onComplete(formData)──►  'queue'  ──matched──►  'chat'
  ▲                                                           │
  └─────────────── partner_disconnected / end_chat ──────────┘
```

---

## 8. File Structure (Deliverables)

```
ChatWithMe/
├── .agents/agents.md
├── production_artifacts/
│   └── Technical_Specification.md       ← This file
├── app_build/
│   ├── client/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── App.jsx
│   │       ├── App.css
│   │       ├── hooks/
│   │       │   └── useSocket.js
│   │       └── components/
│   │           ├── Stepper.jsx
│   │           ├── Stepper.css
│   │           ├── PreferenceForm.jsx
│   │           ├── QueueStatus.jsx
│   │           ├── ChatWindow.jsx
│   │           └── OnlineCounter.jsx
│   └── server/
│       ├── package.json
│       ├── index.js
│       ├── matchmaker.js
│       └── presence.js
└── README.md
```

---

## 9. Confirmed Decisions

| Decision | Choice |
|---|---|
| **Post-chat flow** | Show **"Find New Stranger"** button — reuses last form data, no re-entry needed |
| **City matching** | Prefer same-city matches first, fall back to any city if no match in 5s |
| **Typing indicator** | ✅ Include — show *"Stranger is typing…"* indicator |
| **Mobile** | ✅ Include — fully responsive layout for v1 |

---

*Written by @pm | ✅ Approved — @engineer may begin coding.*
