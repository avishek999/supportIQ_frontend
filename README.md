# SupportIQ — Context-Aware RAG Support Platform

> **GitHub Short Description**:  
> *A context-aware RAG AI support platform built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui. Ingest documents & web links to chat intelligently with your knowledge base.*

---

## ⚡ Overview

**SupportIQ** is an AI-powered, context-driven Retrieval-Augmented Generation (RAG) software designed for modern teams. It allows users to upload documents (PDF, CSV, TXT) or paste live web links, instantly building context for intelligent, source-backed back-and-forth conversations.

---

## ✨ Features

- 📄 **Document & Web Link Context Ingestion**: Upload PDF, CSV, or TXT files or paste live URLs for instant vector embedding & chunking.
- 💬 **Interactive Chat Interface**: Real-time message streaming UI with AI assistant thinking indicators, optimistic rendering, and auto-scrolling.
- 🎨 **Rich Markdown Rendering**: Formats AI responses with bold text, bulleted & numbered lists, code snippets, and formatted tables (`react-markdown` + `remark-gfm`).
- 🔐 **Cookie-Based Authentication**: Complete Signup and Login flows with client-side Zod validation, HTTP-only auth cookies, and an Axios 401 auto-redirect interceptor.
- 🛡️ **Route Protection**: Next.js Middleware and Client-side Auth Guards prevent unauthenticated access to protected routes (`/chat`) and redirect authenticated users away from auth pages.
- 📱 **Fully Responsive Layout**: Mobile drawer navigation sidebar, collapsible upload context selector with smooth animations, and dark-mode-first aesthetic.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/) & [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [tw-animate-css](https://github.com/animate-css/animate.css)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [Lucide Icons](https://lucide.dev/)
- **Validation & Formats**: [Zod](https://zod.dev/) & [React Markdown](https://github.com/remarkjs/react-markdown)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📁 Project Structure

```
supportiq/
├── app/
│   ├── auth/
│   │   ├── layout.tsx         # Sleek 60/40 auth split layout
│   │   ├── login/page.tsx     # Login form with Zod & Axios integration
│   │   └── signup/page.tsx    # Registration form with auto-login redirect
│   ├── chat/
│   │   └── page.tsx           # Responsive main chat UI with context sidebar
│   ├── globals.css            # Tailwind v4 theme & CSS variable setup
│   ├── layout.tsx             # Root layout with Theme & Auth providers
│   └── page.tsx               # Root redirect handler
├── components/
│   ├── auth-provider.tsx      # Auth Context Provider & route protection guard
│   ├── context-selector.tsx   # File & Link upload box with smooth animations
│   ├── markdown-renderer.tsx  # Rich Markdown renderer for AI responses
│   ├── siq-button.tsx         # Reusable button with loading & icon support
│   ├── siq-input.tsx          # Accessible input field with floating tooltips
│   └── theme-provider.tsx     # Next-themes dark mode configuration
├── lib/
│   ├── api/
│   │   ├── axios.ts           # Axios client with withCredentials & 401 interceptor
│   │   ├── auth.api.ts        # Register, Login, Logout & Me API endpoints
│   │   ├── conversation.api.ts# Conversation list, creation & message endpoints
│   │   └── document.api.ts    # File & Web Link ingestion API endpoints
│   ├── dto/
│   │   └── auth.dto.ts        # Zod validation schemas for auth inputs
│   ├── types/
│   │   └── chat.types.ts      # TypeScript interfaces for Chat, Docs & Messages
│   └── config.ts              # API routes & base URL configuration
├── middleware.ts              # Server-side cookie route protection middleware
└── .env                       # Environment configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node.js (v18+) and `pnpm` installed.

### 2. Installation

Clone the repository and install dependencies:

```bash
cd supportiq
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 4. Run Development Server

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Endpoints Summary

| Feature | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register new user & set cookie |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & set cookie |
| **Auth** | `POST` | `/api/auth/logout` | Clear auth cookies |
| **Auth** | `GET` | `/api/auth/me` | Fetch active user session |
| **Documents** | `POST` | `/api/documents/upload` | Ingest PDF, CSV, TXT (`FormData: "file"`) |
| **Documents** | `POST` | `/api/documents/link` | Ingest web URL (`{ "url": "..." }`) |
| **Conversations** | `GET` | `/api/conversations` | List user conversations |
| **Conversations** | `POST` | `/api/conversations` | Create conversation linked to `documentId` |
| **Messages** | `GET` | `/api/conversations/:id/messages` | Fetch conversation message history |
| **Messages** | `POST` | `/api/conversations/:id/messages` | Send message & receive AI reply |

---

## 📜 License

This project is licensed under the MIT License.
# supportIQ_frontend
