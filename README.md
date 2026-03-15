# Resonate

> Customer Feedback & Product Roadmap Platform

A modern SaaS platform that helps product teams collect, organize, and prioritize customer feedback. Built with **Next.js 14** and **NestJS**, Resonate enables companies to build public roadmaps, manage feature requests, and communicate releases effectively.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

### The Problem

Product teams struggle with:
- **Scattered feedback** across email, Slack, support tickets, and spreadsheets
- **No visibility** into what customers actually want
- **Poor communication** of product direction to customers
- **Manual effort** to track and prioritize feature requests

### The Solution

Resonate provides a centralized platform where:
- Customers submit and vote on feature requests
- Product teams visualize demand through voting signals
- Public roadmaps build transparency and trust
- Changelogs keep users informed of releases

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Multi-tenant Workspaces** | Isolated environments for different organizations |
| **Feedback Boards** | Create multiple boards per product (public or private) |
| **Feature Voting** | Upvote system with rate limiting to prevent gaming |
| **Status Workflow** | Open → Under Review → Planned → In Progress → Shipped |
| **Public Roadmap** | Drag-and-drop kanban board for planned features |
| **Changelog** | Rich-text release notes with email notifications |
| **Embeddable Widget** | JavaScript snippet for in-app feedback collection |
| **Team Collaboration** | Internal comments visible only to team members |

### Security Features

- JWT authentication with token versioning (revocation support)
- Role-based access control (Owner, Admin, Member, Viewer)
- Rate limiting on voting and submissions
- Login lockout after failed attempts
- Input sanitization and XSS protection
- CORS configuration for widget embedding

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RESONATE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │  Dashboard  │    │   Public    │    │  Embed      │                    │
│   │  (Next.js)  │    │   Portal    │    │  Widget     │                    │
│   │  /dashboard │    │   /[slug]   │    │  widget.js  │                    │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                    │
│          │                  │                  │                            │
│          └──────────────────┼──────────────────┘                            │
│                             │                                               │
│                    ┌────────▼────────┐                                      │
│                    │   API Gateway   │                                      │
│                    │    (NestJS)     │                                      │
│                    └────────┬────────┘                                      │
│                             │                                               │
│    ┌────────────────────────┼────────────────────────┐                     │
│    │                        │                        │                     │
│    ▼                        ▼                        ▼                     │
│ ┌──────────┐         ┌──────────┐            ┌──────────┐                  │
│ │   Auth   │         │   Core   │            │  Notify  │                  │
│ │  Module  │         │ Modules  │            │  Module  │                  │
│ └────┬─────┘         └────┬─────┘            └────┬─────┘                  │
│      │                    │                       │                        │
│      └────────────────────┼───────────────────────┘                        │
│                           ▼                                                 │
│                    ┌──────────────┐        ┌──────────────┐                │
│                    │  PostgreSQL  │        │    Redis     │                │
│                    │   (Prisma)   │        │ (Cache/Rate) │                │
│                    └──────────────┘        └──────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Multi-tenant shared DB** | Row-level isolation via `workspaceId`; cost-effective |
| **Soft deletes** | Audit trail and data recovery capabilities |
| **Denormalized vote counts** | Performance optimization for sorting |
| **Redis rate limiting** | Prevent vote manipulation and abuse |
| **Separate public/admin APIs** | Different authentication requirements |

---

## Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **ORM:** Prisma 5
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Validation:** class-validator, class-transformer
- **Auth:** Passport.js, JWT
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Rich Text:** Tiptap

### DevOps
- **Containers:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Reverse Proxy:** Nginx

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+ (recommended) or npm
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resonate.git
   cd resonate
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   pnpm install

   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Server
   cp server/.env.example server/.env

   # Client
   cp client/.env.example client/.env.local
   ```

4. **Start infrastructure (Docker)**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**
   ```bash
   cd server
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd server
   pnpm start:dev

   # Terminal 2: Frontend
   cd client
   pnpm dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs: http://localhost:4000/api/docs

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Project Structure

```
resonate/
├── server/                      # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication & authorization
│   │   │   ├── strategies/     # Passport strategies (JWT, Google)
│   │   │   ├── guards/         # Auth guards
│   │   │   └── decorators/     # Custom decorators
│   │   ├── core/               # Business logic modules
│   │   │   ├── workspaces/     # Multi-tenancy
│   │   │   ├── memberships/    # Team management
│   │   │   ├── boards/         # Feedback boards
│   │   │   ├── posts/          # Feature requests
│   │   │   ├── votes/          # Voting system
│   │   │   ├── comments/       # Discussions
│   │   │   ├── roadmap/        # Public roadmap
│   │   │   └── changelog/      # Release notes
│   │   ├── public/             # Unauthenticated endpoints
│   │   ├── notifications/      # Email & webhooks
│   │   ├── common/             # Shared utilities
│   │   └── infrastructure/     # Database, cache, queues
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Migration history
│   │   └── seed.ts             # Seed data
│   └── test/                   # E2E tests
│
├── client/                      # Next.js Frontend
│   ├── app/
│   │   ├── (marketing)/        # Landing, pricing pages
│   │   ├── (auth)/             # Login, register, forgot password
│   │   ├── (dashboard)/        # Protected admin area
│   │   │   └── [workspaceSlug]/
│   │   └── [workspaceSlug]/    # Public portal (SSR)
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── forms/              # Form components
│   │   ├── features/           # Feature-specific components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── api/                # API client
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   └── widget/                  # Embeddable widget SDK
│
├── docker/                      # Docker configurations
├── nginx/                       # Nginx configurations
├── docker-compose.yml
└── README.md
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate tokens |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user |

### Workspace Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces` | List user's workspaces |
| POST | `/workspaces` | Create workspace |
| GET | `/workspaces/:slug` | Get workspace details |
| PATCH | `/workspaces/:slug` | Update workspace |
| DELETE | `/workspaces/:slug` | Delete workspace |

### Board Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces/:slug/boards` | List boards |
| POST | `/workspaces/:slug/boards` | Create board |
| GET | `/boards/:id` | Get board |
| PATCH | `/boards/:id` | Update board |
| DELETE | `/boards/:id` | Delete board |

### Post Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boards/:id/posts` | List posts (with filters) |
| POST | `/boards/:id/posts` | Create post |
| GET | `/posts/:id` | Get post |
| PATCH | `/posts/:id` | Update post |
| DELETE | `/posts/:id` | Delete post |
| POST | `/posts/:id/vote` | Vote on post |
| DELETE | `/posts/:id/vote` | Remove vote |
| POST | `/posts/:id/merge` | Merge duplicate posts |

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/:slug` | Get public workspace |
| GET | `/public/:slug/boards` | List public boards |
| GET | `/public/:slug/boards/:boardSlug/posts` | List public posts |
| GET | `/public/:slug/roadmap` | Get public roadmap |
| GET | `/public/:slug/changelog` | Get public changelog |

---

## Database Schema

### Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│   Workspace   │──────<│  Membership   │>──────│     User      │
└───────┬───────┘       └───────────────┘       └───────┬───────┘
        │                                               │
        │ 1:N                                           │ 1:N
        ▼                                               │
┌───────────────┐                                       │
│     Board     │                                       │
└───────┬───────┘                                       │
        │                                               │
        │ 1:N                                           │
        ▼                                               │
┌───────────────┐       ┌───────────────┐              │
│   Category    │       │     Post      │<─────────────┘
└───────┬───────┘       └───────┬───────┘
        │                       │
        │ 1:N                   │ 1:N
        │                       ├──────────────┐
        ▼                       ▼              ▼
        │               ┌───────────────┐ ┌───────────┐
        └──────────────>│     Vote      │ │  Comment  │
                        └───────────────┘ └───────────┘
```

### Key Models

```prisma
model Workspace {
  id           String       @id @default(cuid())
  name         String
  slug         String       @unique
  logo         String?
  customDomain String?      @unique
  plan         Plan         @default(FREE)

  memberships  Membership[]
  boards       Board[]
  changelogs   Changelog[]

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  deletedAt    DateTime?
}

model Post {
  id           String      @id @default(cuid())
  boardId      String
  authorId     String
  title        String
  content      String      @db.Text
  status       PostStatus  @default(OPEN)
  voteCount    Int         @default(0)  // Denormalized
  commentCount Int         @default(0)  // Denormalized
  isLocked     Boolean     @default(false)
  isPinned     Boolean     @default(false)
  mergedIntoId String?

  board        Board       @relation(fields: [boardId], references: [id])
  author       User        @relation(fields: [authorId], references: [id])
  votes        Vote[]
  comments     Comment[]

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([boardId, status])
  @@index([boardId, voteCount(sort: Desc)])
}
```

---

## Authentication & Authorization

### JWT Token Strategy

```
Access Token (15 min)
├── userId
├── email
├── tokenVersion (for revocation)
└── iat, exp

Refresh Token (7 days)
├── userId
├── tokenVersion
└── iat, exp
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Owner** | Full workspace control, billing, delete workspace |
| **Admin** | Manage members, boards, posts, roadmap, changelog |
| **Member** | Create posts, vote, comment |
| **Viewer** | Read-only access, vote only |

### Permission Matrix

```
Action                    Owner   Admin   Member   Viewer   Public
────────────────────────────────────────────────────────────────────
Create Board                ✓       ✓        ✗        ✗        ✗
Edit Board Settings         ✓       ✓        ✗        ✗        ✗
Delete Board                ✓       ✗        ✗        ✗        ✗
Create Post                 ✓       ✓        ✓        ✗        ✓*
Edit Any Post               ✓       ✓        ✗        ✗        ✗
Change Post Status          ✓       ✓        ✗        ✗        ✗
Vote                        ✓       ✓        ✓        ✓        ✓*
Internal Comment            ✓       ✓        ✓        ✓        ✗
Manage Roadmap              ✓       ✓        ✗        ✗        ✗
Invite Members              ✓       ✓        ✗        ✗        ✗
Manage Billing              ✓       ✗        ✗        ✗        ✗

* Requires email verification
```

---

## Deployment

### Environment Variables

#### Server (.env)
```env
# Application
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/resonate

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Docker Production Build

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

- **API Health:** `GET /health`
- **Database:** `GET /health/db`
- **Redis:** `GET /health/redis`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Use conventional commits

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

**Your Name** - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/yourusername/resonate](https://github.com/yourusername/resonate)

---

<p align="center">
  Built with modern technologies for production-ready SaaS applications.
</p>
