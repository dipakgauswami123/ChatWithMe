# ChatWithMe 💬

A modern, anonymous, real-time chat application built with React, Node.js, and Socket.io. ChatWithMe matches you with strangers based on your preferences (Age, Gender) instantly without requiring any accounts or saving any history.

## Features ✨
- **100% Anonymous:** No sign-ups, no profiles, no chat logs.
- **Real-Time Messaging:** Instant messaging powered by Socket.io.
- **Smart Matchmaking:** Mutual matching based on gender and age preferences.
- **Typing Indicators:** See when your partner is typing in real-time.
- **Live Online Counter:** See how many people are currently online.
- **Beautiful UI:** A clean, professional, responsive design with smooth animations.

---

## Local Development 🚀

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Start the Backend Server
The server handles the matchmaking and real-time Socket.io connections.
```bash
cd app_build/server
npm install
npm start
```
The server will run on `http://localhost:3001`.

### 2. Start the Frontend Client
The client is a modern React app powered by Vite. Open a **new terminal tab**:
```bash
cd app_build/client
npm install
npm run dev
```
The client will run on `http://localhost:5173`. Open this URL in your browser to start chatting!

---

## Deployment Guide 🌍

To put this app on the internet, you need to deploy the **Frontend** and **Backend** separately.

**Why?** 
Vercel is amazing for Frontend (React), but it uses "Serverless Functions" for backends. Socket.io requires a constant, long-lived connection, which serverless functions do not support well. Therefore, the best setup is:
- **Frontend:** Vercel
- **Backend:** Render (or Railway)

### Step 1: Deploy Backend to Render (Free)
1. Push your entire project to a **GitHub repository**.
2. Create an account on [Render](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub account and select your repository.
5. Configure the Web Service:
   - **Root Directory:** `app_build/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add an Environment Variable:
   - Key: `CLIENT_ORIGIN`
   - Value: `*` *(We will update this later once Vercel gives us a frontend URL)*
7. Click **Create Web Service**. Render will give you a live URL (e.g., `https://chatwithme-api.onrender.com`).

### Step 2: Deploy Frontend to Vercel (Free)
1. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the Project:
   - **Root Directory:** Edit this and select `app_build/client`.
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add an Environment Variable so the Frontend knows where the Backend is:
   - Key: `VITE_SERVER_URL`
   - Value: `https://chatwithme-api.onrender.com` *(Paste the Render URL you got from Step 1)*
5. Click **Deploy**. Vercel will give you a live URL (e.g., `https://chatwithme.vercel.app`).

### Step 3: Secure the Backend (Optional but recommended)
Go back to your Render Web Service dashboard, and update the `CLIENT_ORIGIN` environment variable to your exact Vercel URL (e.g., `https://chatwithme.vercel.app`). This prevents unauthorized websites from connecting to your chat server!

You're done! 🎉 Share your Vercel link with your friends to chat anonymously!
