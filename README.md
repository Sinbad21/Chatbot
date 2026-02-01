# Omnical Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

**Status:** Beta - Core features operational, advanced features in development (~40% complete)

A modern, enterprise-grade SaaS platform for creating and managing AI-powered chatbots. Built with TypeScript, Next.js, Express.js, and Cloudflare Workers for global edge deployment.

## ✨ Features

### ✅ Currently Implemented (Core Features)
- 🔐 **JWT Authentication**: Secure token-based auth with access + refresh tokens
- 👥 **Multi-Tenancy**: Organization-based isolation with role-based access control
- 🤖 **Bot Management**: Create, configure, and manage multiple chatbots
- 💬 **AI Chat**: OpenAI GPT-5 Mini integration with conversation history
- 📄 **Document Processing**: Upload and extract text from PDF, DOCX, TXT, MD files
- 🗄️ **PostgreSQL Database**: 23-table schema via Prisma ORM (Neon serverless)
- 🔒 **Security**: bcrypt hashing, rate limiting, CORS, Helmet.js security headers
- 🌍 **Edge Deployment**: Cloudflare Pages + Workers for global low-latency

### 🚧 In Development (Partially Implemented)
- 📊 **Analytics Dashboard**: UI exists, backend integration needed
- 💳 **Billing System**: Database ready, Stripe integration pending
- 📱 **Multi-Channel**: Code ready for WhatsApp, Telegram, Slack, Discord (not connected)
- 🎯 **Lead Management**: Database schema complete, features pending

### ❌ Planned Features (Not Yet Implemented)
- 🧠 **Vector Embeddings**: Semantic search with FAISS/Pinecone
- 🧪 **Testing Suite**: Comprehensive test coverage needed
- 🐳 **Docker Support**: Containerization planned
- 📱 **Mobile App**: React Native app planned

> **Note:** For detailed feature status, see [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## 🏗️ Architecture

### Monorepo Structure (Turborepo + npm workspaces)

```
ChatBot/
├── apps/
│   ├── api/                    # Express.js REST API (Node.js)
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints (auth, bots, chat, documents, etc.)
│   │   │   ├── controllers/   # Business logic
│   │   │   ├── middleware/    # Auth, validation, rate limiting
│   │   │   └── index.ts       # Express server (port 3001)
│   │   └── package.json
│   │
│   ├── api-worker/            # Cloudflare Workers (Edge API)
│   │   ├── src/
│   │   │   └── index.ts       # Hono framework, chat endpoint, RAG
│   │   ├── wrangler.toml      # Cloudflare config
│   │   └── package.json
│   │
│   ├── web/                   # Next.js 15 frontend (React 18)
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   │   ├── auth/      # Login, register
│   │   │   │   ├── dashboard/ # Bot management, analytics, settings
│   │   │   │   ├── pricing/   # Pricing page
│   │   │   │   └── page.tsx   # Landing page
│   │   │   └── components/    # React components
│   │   └── package.json
│   │
│   └── widget/                # Embeddable chat widget (Vite + React)
│       ├── src/
│       └── package.json
│
├── packages/                  # Shared libraries
│   ├── auth/                  # JWT token generation/validation
│   ├── database/              # Prisma ORM schema (23 tables)
│   ├── document-processor/    # PDF/DOCX text extraction
│   ├── email/                 # SMTP email service (nodemailer)
│   ├── language-detector/     # Multi-language detection
│   └── multi-channel/         # WhatsApp, Telegram, Slack adapters
│
├── scripts/                   # DevOps scripts
├── .github/                   # GitHub Actions (needs fixing)
├── package.json               # Root workspace config
├── turbo.json                 # Turbo build orchestration
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment variables template
├── README.md                  # This file
└── PROJECT_STATUS.md          # Detailed feature status report
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and **npm 9+**
- **PostgreSQL** (Neon serverless recommended)
- **OpenAI API key**
- **Cloudflare account** (for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/Sinbad21/Chatbot.git
cd Chatbot
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies for all workspaces (apps and packages).

### 3. Environment Configuration

Create a `.env` file in the root directory (use `.env.example` as template):

```env
# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT Security
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# API Configuration
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Cloudflare (for production deployment)
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"

# Frontend
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 4. Database Setup

```bash
# Navigate to database package
cd packages/database

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# (Optional) Seed database with sample data
npx prisma db seed

# Return to root
cd ../..
```

### 5. Start Development Servers

```bash
# Start all apps in development mode (Turborepo)
npm run dev
```

This starts:
- **API Server**: `http://localhost:3001`
- **Web App**: `http://localhost:3000`
- **Widget**: `http://localhost:5173`

Or start individually:

```bash
# Start only the API
npm run dev --workspace=apps/api

# Start only the web app
npm run dev --workspace=apps/web
```

### 6. Access the Application

- **Web Interface**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health
- **Dashboard**: http://localhost:3000/dashboard (after login)

## 📖 API Usage Examples

### Authentication

```bash
# Register a new user
curl -X POST "http://localhost:3001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# Login
curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Response includes accessToken and refreshToken
# Use access token for authenticated requests
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:3001/api/v1/auth/me"
```

### Bot Management

```bash
# Create a bot
curl -X POST "http://localhost:3001/api/v1/bots" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Assistant",
    "description": "Helps with research queries",
    "systemPrompt": "You are a helpful research assistant.",
    "welcomeMessage": "Hello! How can I help with your research today?",
    "color": "#3B82F6"
  }'

# List all bots for your organization
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/bots"

# Get specific bot
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/bots/BOT_ID"

# Update bot
curl -X PUT "http://localhost:3001/api/v1/bots/BOT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Bot Name"}'

# Delete bot
curl -X DELETE "http://localhost:3001/api/v1/bots/BOT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Document Upload

```bash
# Upload document to a bot
curl -X POST "http://localhost:3001/api/v1/documents/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@research_paper.pdf" \
  -F "botId=BOT_ID"

# List documents for a bot
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/documents?botId=BOT_ID"

# Delete document
curl -X DELETE "http://localhost:3001/api/v1/documents/DOCUMENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Chat

```bash
# Send a message (public endpoint, rate-limited)
curl -X POST "http://localhost:3001/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the main findings from the research paper?",
    "botId": "BOT_ID",
    "conversationId": "optional-conversation-id"
  }'

# Get conversation history
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/conversations/CONVERSATION_ID"
```

## 🔧 Development

### Build Commands

```bash
# Build all apps and packages
npm run build

# Build specific workspace
npm run build --workspace=apps/web

# Build for production (web app)
npm run build:web
```

### Database Management

```bash
# Create new migration after schema changes
cd packages/database
npx prisma migrate dev --name "description_of_changes"

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Code Quality

```bash
# Format code with Prettier
npm run format

# Lint TypeScript code
npm run lint

# Type checking
npm run type-check
```

## 🌍 Deployment

### Cloudflare Pages (Frontend) + Workers (Backend)

#### Deploy Frontend

```bash
cd apps/web

# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages publish .next
```

#### Deploy API Worker

```bash
cd apps/api-worker

# Build worker
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Or with wrangler directly
npx wrangler deploy
```

#### Environment Variables

Set environment variables in Cloudflare dashboard:
- Pages: Settings > Environment Variables
- Workers: Settings > Variables and Secrets

### Alternative: Traditional Hosting

For non-Cloudflare deployment:

```bash
# Build all
npm run build

# Start production API server
cd apps/api
npm run start

# Start production web server
cd apps/web
npm run start
```

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **JWT Tokens**: Short-lived access tokens (15min) with refresh mechanism (7 days)
- ✅ **Role-Based Access Control**: OWNER, ADMIN, MEMBER, VIEWER roles
- ✅ **Input Validation**: express-validator on all endpoints
- ✅ **CORS Protection**: Configurable allowed origins
- ✅ **Rate Limiting**: 5 requests/15min on auth, 30 requests/min on chat
- ✅ **Security Headers**: Helmet.js (XSS, CSP, HSTS protection)
- ✅ **SQL Injection Protection**: Prisma ORM parameterized queries
- ✅ **Disposable Email Blocking**: Prevents temporary email registrations
- ❌ **2FA/MFA**: Not yet implemented
- ❌ **API Key Encryption**: Not yet implemented

## 🤖 AI Chat System

### Current Implementation

The chat system uses **OpenAI GPT-5 Mini** with basic RAG (Retrieval-Augmented Generation):

1. **Document Retrieval**: Loads all documents associated with the bot
2. **Context Building**: Concatenates document content + intents + FAQs
3. **Conversation History**: Includes last 10 messages for context
4. **AI Generation**: Sends context to OpenAI GPT-5 Mini
5. **Response**: Returns AI-generated response with token usage tracking

**Location:** `apps/api-worker/src/index.ts` (lines 2060-2270)

### Limitations

- ❌ **No Vector Embeddings**: Does not use OpenAI embeddings or FAISS
- ❌ **No Semantic Search**: Simple text concatenation, not similarity-based
- ❌ **Scalability**: Performance degrades with many documents
- ❌ **No Citation**: Doesn't track which document provided the answer

### Planned Improvements

- [ ] Implement vector embeddings with Pinecone or FAISS
- [ ] Add semantic search with cosine similarity
- [ ] Implement document chunking strategy
- [ ] Add citation tracking to responses
- [ ] Support for other AI models (Anthropic Claude, Gemini)

## 🧪 Testing

> **Status:** ❌ No tests currently implemented - this is a critical gap

### Planned Testing Setup

```bash
# Install testing dependencies (planned)
npm install --save-dev jest @types/jest ts-jest supertest

# Run tests (not yet functional)
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

**Priority:** Setting up Jest/Vitest with 60%+ coverage is Phase 1 critical task.

## 🐛 Troubleshooting

### Common Issues

**"npm install fails"**
- Ensure Node.js 20+ and npm 9+ are installed
- Try: `npm install --legacy-peer-deps`
- Clear cache: `npm cache clean --force`

**"Database connection errors"**
- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running (or Neon DB is accessible)
- Check SSL mode: add `?sslmode=require` to connection string
- Run migrations: `cd packages/database && npx prisma migrate deploy`

**"API returns 401 Unauthorized"**
- Check JWT token is included in Authorization header
- Token may be expired (15min lifetime) - use refresh token
- Verify `JWT_SECRET` matches between frontend and backend

**"Frontend can't connect to API"**
- Check `NEXT_PUBLIC_API_URL` in `.env` matches API server URL
- Verify CORS is configured correctly in `apps/api/src/index.ts`
- Check API server is running on port 3001

**"OpenAI API errors"**
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI account has credits
- Review rate limits on OpenAI dashboard

**"Cloudflare deployment fails"**
- Ensure `wrangler` is installed: `npm install -g wrangler`
- Login to Cloudflare: `npx wrangler login`
- Check `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are set

### Getting Help

- **Documentation**: See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed feature status
- **Deployment**: See [SETUP_AND_DEPLOY.md](./SETUP_AND_DEPLOY.md) for deployment guides
- **API Testing**: See [TEST_COMMANDS.md](./TEST_COMMANDS.md) for curl examples
- **Issues**: Open an issue on GitHub for bugs or feature requests

## 📊 Project Status

For a comprehensive analysis of implemented vs. planned features, see:
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Detailed feature-by-feature status
- [FEATURE_COMPARISON_REPORT.md](./FEATURE_COMPARISON_REPORT.md) - 40-page analysis

**Current Completion: ~40%**

| Category | Status |
|----------|--------|
| Authentication | 🟡 67% |
| Bot Management | 🟡 63% |
| AI Chat System | 🟡 60% |
| Document Processing | 🟠 56% |
| Security | 🟢 80% |
| Analytics Dashboard | 🔴 25% |
| Multi-Channel Integrations | 🔴 20% |
| Billing & Subscriptions | � 80% |
| Testing & CI/CD | 🔴 0% |

**Legend:** 🟢 80%+ | 🟡 50-79% | 🟠 30-49% | 🔴 <30%

## 🗺️ Roadmap

### Phase 1: Critical Fixes (2-3 weeks)
- [ ] Add comprehensive test suite (Jest/Vitest)
- [ ] Implement real analytics (connect backend data)
- [ ] Fix CI/CD pipeline (GitHub Actions)
- [ ] Add proper error handling to all endpoints
- [x] Update documentation (this README)

### Phase 2: Core Features (4-6 weeks)
- [x] Stripe billing integration
- [ ] Connect multi-channel integrations (WhatsApp, Telegram, Slack)
- [ ] Implement vector embeddings with Pinecone/FAISS
- [ ] Build real-time analytics dashboard
- [ ] Lead management features

### Phase 3: Advanced Features (6-8 weeks)
- [ ] Two-factor authentication (2FA)
- [ ] Bot marketplace
- [ ] Advanced RAG with semantic search
- [ ] Mobile app (React Native)
- [ ] Admin panel

### Phase 4: Enterprise (8-12 weeks)
- [ ] SSO/SAML integration
- [ ] White-labeling support
- [ ] Advanced analytics with custom reports
- [ ] API rate limiting tiers
- [ ] SLA monitoring

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write/update tests (when test suite is set up)
5. Ensure TypeScript compiles: `npm run build`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Use TypeScript with proper type annotations
- Follow existing code style (Prettier + ESLint)
- Add tests for new features (when available)
- Update documentation for significant changes
- Keep commits atomic and well-described
- Ensure no TypeScript errors: `npm run type-check`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework for production
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Cloudflare](https://www.cloudflare.com/) - Edge computing platform
- [OpenAI](https://openai.com/) - AI models and API
- [Turborepo](https://turbo.build/) - High-performance monorepo build system
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with TypeScript, Next.js, and ❤️**
