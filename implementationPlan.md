Step-by-Step Implementation Stack for Anonymous Chat App
1. Prerequisites and Dependencies
Before starting, ensure you have:

Node.js (v18+) and npm installed

Google Antigravity installed (download from antigravity.google/download)

A Google account for Antigravity authentication (personal Gmail works)

Basic project folder structure ready

Install the required dependencies:

bash
npm install motion
npm install socket.io socket.io-client express
The motion library is required for the Stepper component's animations.

2. Project Structure
text
anonymous-chat/
├── .agents/
│   ├── agents.md
│   └── skills/
│       ├── write_specs.md
│       ├── generate_code.md
│       └── audit_code.md
├── production_artifacts/
│   └── Technical_Specification.md
├── app_build/
│   ├── client/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Stepper.jsx
│   │   │   │   ├── Stepper.css
│   │   │   │   ├── PreferenceForm.jsx
│   │   │   │   ├── QueueStatus.jsx
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   └── OnlineCounter.jsx
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   └── package.json
│   └── server/
│       ├── index.js
│       ├── matchmaker.js
│       └── presence.js
└── README.md
3. Step-by-Step Implementation Order
Step 1: Set Up Antigravity Agents Configuration
Create .agents/agents.md with role definitions:

markdown
# 🤖 Autonomous Development Team

## The Product Manager (@pm)
**Goal**: Translate user ideas into rigorous Technical Specifications.
**Constraint**: Pause for explicit user approval before coding.

## The Full-Stack Engineer (@engineer)
**Goal**: Translate the approved spec into production-ready code.
**Constraint**: Save all code to `app_build/`.

## The QA Engineer (@qa)
**Goal**: Hunt for bugs, missing dependencies, and logic errors.
**Constraint**: Overwrite flawed files with fixes.
Step 2: Create the Specification Skill
Create .agents/skills/write_specs.md to generate the technical specification:

markdown
# Skill: Write Specs

## Objective
Turn the anonymous chat app idea into a Technical Specification.

## Rules
- **Save Location**: `production_artifacts/Technical_Specification.md`
- **Approval Gate**: Ask for user approval before proceeding.
- **Iterative Rework**: If comments are left, re-read and revise.

## Required Sections
1. Executive Summary
2. Functional Requirements (form fields, matchmaking, chat)
3. Non-Functional Requirements (privacy, latency, scalability)
4. Architecture & Tech Stack (React, Node.js, Socket.IO)
5. Matchmaking Algorithm (bidirectional gender check)
6. Presence Tracking Strategy
Step 3: Build the Stepper Component
Copy the Stepper component source from your provided reference into app_build/client/src/components/Stepper.jsx and the CSS into Stepper.css.

Key integration points:

Import motion from motion/react

Use Step components for each form stage

Configure onFinalStepCompleted to trigger the join_queue Socket.IO event

Step 4: Build the Preference Form with Stepper
Create PreferenceForm.jsx using the Stepper component:

jsx
import Stepper, { Step } from './Stepper';

function PreferenceForm({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '', gender: '', preferredGender: '', city: ''
  });

  return (
    <Stepper
      onFinalStepCompleted={() => onComplete(formData)}
      backButtonText="Previous"
      nextButtonText="Continue"
    >
      <Step>
        <h2>Welcome</h2>
        <p>Tell us about yourself for matchmaking.</p>
      </Step>
      <Step>
        <h2>Your Age</h2>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({...formData, age: e.target.value})}
          placeholder="Enter your age"
        />
      </Step>
      <Step>
        <h2>Your Gender</h2>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value})}
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Step>
      <Step>
        <h2>Preferred Chat Gender</h2>
        <select
          value={formData.preferredGender}
          onChange={(e) => setFormData({...formData, preferredGender: e.target.value})}
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="any">Any</option>
        </select>
      </Step>
      <Step>
        <h2>Your City</h2>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          placeholder="Enter your city"
        />
      </Step>
      <Step>
        <h2>Ready to Chat</h2>
        <p>Click Complete to start matching.</p>
      </Step>
    </Stepper>
  );
}
Step 5: Create the Socket.IO Client Hook
Create a custom hook for socket management:

jsx
// useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    
    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));
    socketRef.current.on('online_count', ({ count }) => setOnlineCount(count));

    return () => socketRef.current?.disconnect();
  }, []);

  return { socket: socketRef.current, onlineCount, isConnected };
}
Step 6: Build the Backend Server
Create app_build/server/index.js:

javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
});

// In-memory state
const waitingQueue = new Map(); // socketId -> user data
const activeRooms = new Map(); // roomId -> { users: [socketId1, socketId2] }
const socketToRoom = new Map(); // socketId -> roomId

// Presence counter
let onlineCount = 0;
const lobby = io.of('/');

function updateOnlineCount() {
  onlineCount = lobby.sockets.size;
  lobby.emit('online_count', { count: onlineCount });
}

function isMatch(userA, userB) {
  const aLikesB = userA.preferredGender === 'any' || 
                  userA.preferredGender === userB.gender;
  const bLikesA = userB.preferredGender === 'any' || 
                  userB.preferredGender === userA.gender;
  return aLikesB && bLikesA;
}

function tryMatch() {
  const waiting = Array.from(waitingQueue.entries());
  
  for (let i = 0; i < waiting.length; i++) {
    for (let j = i + 1; j < waiting.length; j++) {
      const [idA, userA] = waiting[i];
      const [idB, userB] = waiting[j];
      
      if (isMatch(userA, userB)) {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        activeRooms.set(roomId, { users: [idA, idB] });
        socketToRoom.set(idA, roomId);
        socketToRoom.set(idB, roomId);
        
        waitingQueue.delete(idA);
        waitingQueue.delete(idB);
        
        lobby.sockets.get(idA)?.join(roomId);
        lobby.sockets.get(idB)?.join(roomId);
        
        io.to(idA).emit('matched', { roomId });
        io.to(idB).emit('matched', { roomId });
        
        return true;
      }
    }
  }
  return false;
}

io.on('connection', (socket) => {
  updateOnlineCount();

  socket.on('join_queue', (userData) => {
    waitingQueue.set(socket.id, { ...userData, socketId: socket.id });
    if (!tryMatch()) {
      socket.emit('queue_waiting');
    }
  });

  socket.on('chat_message', ({ roomId, text }) => {
    socket.to(roomId).emit('chat_message', {
      text,
      timestamp: Date.now()
    });
  });

  socket.on('end_chat', () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('partner_disconnected');
      const room = activeRooms.get(roomId);
      room?.users.forEach(id => {
        socketToRoom.delete(id);
        lobby.sockets.get(id)?.leave(roomId);
      });
      activeRooms.delete(roomId);
    }
  });

  socket.on('disconnect', () => {
    waitingQueue.delete(socket.id);
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('partner_disconnected');
      const room = activeRooms.get(roomId);
      room?.users.forEach(id => socketToRoom.delete(id));
      activeRooms.delete(roomId);
    }
    updateOnlineCount();
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
Step 7: Build the Chat Window Component
Create ChatWindow.jsx:

jsx
import { useState, useEffect, useRef } from 'react';

function ChatWindow({ socket, roomId, onEndChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat_message', ({ text, timestamp }) => {
      setMessages(prev => [...prev, { text, timestamp, isOwn: false }]);
    });

    socket.on('partner_disconnected', () => {
      setMessages(prev => [...prev, { 
        text: 'Stranger has disconnected.', 
        isSystem: true 
      }]);
    });

    return () => {
      socket.off('chat_message');
      socket.off('partner_disconnected');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('chat_message', { roomId, text: input });
      setMessages(prev => [...prev, { 
        text: input, 
        timestamp: Date.now(), 
        isOwn: true 
      }]);
      setInput('');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Chatting with Stranger</span>
        <button onClick={onEndChat}>End Chat</button>
      </div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isOwn ? 'own' : 'stranger'} ${msg.isSystem ? 'system' : ''}`}>
            {msg.isSystem ? <em>{msg.text}</em> : msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
4. Reference Materials
Core References
Resource	Purpose	URL
React Bits	Component library for animated UI	https://reactbits.dev
Google Antigravity	Agentic development platform	https://antigravity.google
Socket.IO Docs	Real-time communication	https://socket.io/docs
Motion Library	Animation framework for Stepper	https://motion.dev
Antigravity-Specific References
Antigravity 2.0 Overview: Multi-agent orchestration and parallel workflows

Agents.md and Skills.md Codelab: Building autonomous developer pipelines

Antigravity IDE Overview: Agentic development environment

Real-Time Communication References
Why WebSocket over WebRTC for text chat: WebSocket provides reliable, ordered message delivery over TCP, which is ideal for text chat. WebRTC is designed for media streaming and introduces unnecessary complexity.

Socket.IO Room Counting for Presence: io.sockets.adapter.rooms.get('lobby').size provides lightweight presence tracking without external services.

Privacy and Scalability References
Bidirectional matchmaking: Ensures mutual consent by checking both users' gender preferences against each other.

Zero persistence: Messages relayed in-memory and discarded. No database writes for chat content.

Redis adapter for horizontal scaling: Enables Socket.IO room state sharing across multiple server instances.

5. Complete Markdown Prompt for Antigravity
Copy and paste this prompt into Antigravity to generate the implementation plan:

markdown
# Task: Build Anonymous Gender-Preference Chat Application

## Project Context
Build a web application where users anonymously chat with strangers based on gender preferences. Users provide age, gender, preferred chat gender, and city, then click "Start Chat" to enter matchmaking. The app must display live online user counts and support real-time messaging without revealing identities.

## Technology Stack
- **Frontend**: React (Vite) + Socket.IO Client + Motion
- **Backend**: Node.js + Express + Socket.IO
- **UI Components**: React Bits Stepper component (provided)
- **Presence**: Socket.IO room counting
- **Deployment**: Local development first, scalable to Redis adapter

## Implementation Requirements

### 1. User Preference Collection (Stepper-Based)
Use the provided Stepper component to create a multi-step form:
- Step 1: Welcome message
- Step 2: Age input (numeric, 18+ validation)
- Step 3: Gender selection (Male, Female, Other)
- Step 4: Preferred chat gender (Male, Female, Any)
- Step 5: City input (text)
- Step 6: Confirmation and "Complete" to join queue

**Stepper Integration Notes**:
- Import `Stepper, { Step }` from `./Stepper`
- Import `motion` dependency
- Use `onFinalStepCompleted` to trigger `join_queue` Socket.IO event
- Keep form data in React state, pass to callback

### 2. Matchmaking Logic (Backend)
Implement bidirectional gender preference matching:
```javascript
function isMatch(userA, userB) {
  const aLikesB = userA.preferredGender === 'any' || 
                  userA.preferredGender === userB.gender;
  const bLikesA = userB.preferredGender === 'any' || 
                  userB.preferredGender === userA.gender;
  return aLikesB && bLikesA;
}
Use FIFO queue with in-memory Map

On each join_queue, attempt match with all waiting users

On match, create room, join both sockets, emit matched event

3. Real-Time Chat
Use Socket.IO for WebSocket communication

Messages relayed server-side between paired users

No message persistence (memory only)

Handle disconnection: notify partner, clean up room state

4. Presence Tracking
Track total connected sockets: io.sockets.size

Emit online_count on connection/disconnection

Display count in UI via Socket.IO listener

5. Privacy Requirements
No accounts, no PII storage

No IP sharing between users (server relay only)

Messages discarded after delivery

Session data destroyed on disconnect

Deliverables
Technical Specification → production_artifacts/Technical_Specification.md

Frontend Code → app_build/client/

Stepper.jsx + Stepper.css (provided component)

PreferenceForm.jsx (uses Stepper)

ChatWindow.jsx

OnlineCounter.jsx

App.jsx (state management: form → queue → chat)

Backend Code → app_build/server/

index.js (Express + Socket.IO server)

matchmaker.js (matching logic)

presence.js (online count management)

Workflow Instructions
Write Specification First: Create production_artifacts/Technical_Specification.md and pause for approval. Include architecture diagram, event schema, and matchmaking algorithm details.

Generate Code: Only after spec approval, scaffold all files. Ensure:

Stepper component integrated correctly

Socket.IO events match between client and server

Presence count updates in real-time

Audit: Run QA pass to check:

Missing dependencies (motion, socket.io)

Unhandled disconnection edge cases

Matchmaking correctness (bidirectional check)

Run Locally: Start server on port 3001, client on port 5173. Verify:

Form completes and joins queue

Two browser tabs match with each other

Messages relay between tabs

Online count updates on connect/disconnect

Reference Resources
React Bits: https://reactbits.dev

Antigravity Agents/Skills: Use .agents/agents.md and .agents/skills/ structure

Stepper component source: Provided in reference document

text

---

## Summary Checklist

- [ ] Install Antigravity and sign in with Google account
- [ ] Create `.agents/agents.md` with role definitions
- [ ] Create `.agents/skills/write_specs.md`
- [ ] Create `.agents/skills/generate_code.md`
- [ ] Create `.agents/skills/audit_code.md`
- [ ] Run Antigravity with the markdown prompt above
- [ ] Review and approve `Technical_Specification.md`
- [ ] Let agents generate code in `app_build/`
- [ ] Install dependencies (`motion`, `socket.io`, `express`)
- [ ] Start server and client, test matchmaking and chat
- [ ] Verify online count updates in real-time