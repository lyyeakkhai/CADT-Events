# CADT-Events System Design

## Architecture Overview

The CADT-Events system is a modern, modular web application separated into three distinct components:
1. **Backend**: A RESTful API server handling business logic and database interactions.
2. **Frontend**: A user-facing web application for event discovery and interaction.
3. **Frontend-Admin**: A management dashboard for administrators to oversee events and users.

## Technologies and Frameworks

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Express.js
- **Database ORM**: Prisma
- **Data Validation**: Zod
- **Logging**: Pino
- **Security & Middlewares**: Helmet, CORS, Express Rate Limit, Multer (for file uploads)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Compiler**: React Compiler (Babel)

### Frontend-Admin
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Animation**: Motion

## Third-Party Integrations

The project heavily leverages modern third-party services for authentication, media storage, communication, and AI capabilities:

1. **Clerk**
   - **Packages**: `@clerk/express` (Backend), `@clerk/clerk-react` (Frontend & Admin)
   - **Purpose**: Authentication, authorization, and user identity management across the entire stack.

2. **Cloudinary**
   - **Packages**: `cloudinary` (Backend), `@cloudinary/react`, `@cloudinary/url-gen` (Frontend & Admin)
   - **Purpose**: Cloud-based media management. Used for uploading, storing, optimizing, and delivering images (e.g., event posters, user profiles).

3. **Svix**
   - **Packages**: `svix` (Backend)
   - **Purpose**: Webhook sending and verification. Commonly used to securely process incoming webhooks from Clerk (e.g., syncing user creation/updates to the database).

4. **Telegram**
   - **Packages**: `node-telegram-bot-api` (Backend)
   - **Purpose**: Bot integration. Used for sending real-time notifications, alerts, or updates to a Telegram channel or specific users.

5. **Google GenAI (Gemini)**
   - **Packages**: `@google/genai` (Frontend-Admin)
   - **Purpose**: Generative AI integration. Used in the admin portal, potentially for automating event descriptions, data analysis, or chat assistance.

## Integration Tracking

| Integration | Component(s) | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Clerk** | Backend, Frontend, Frontend-Admin | ⏳ Pending | Configuration / implementation needed |
| **Cloudinary** | Backend, Frontend, Frontend-Admin | ⏳ Pending | Configuration / implementation needed |
| **Svix** | Backend | ⏳ Pending | Configuration / implementation needed |
| **Telegram Bot API** | Backend | ⏳ Pending | Configuration / implementation needed |
| **Google GenAI** | Frontend-Admin | ⏳ Pending | Configuration / implementation needed |
