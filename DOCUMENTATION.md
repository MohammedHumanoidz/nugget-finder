# Nugget Finder - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [System Architecture](#system-architecture)
4. [Development Setup](#development-setup)
5. [Core Features](#core-features)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

Nugget Finder is an AI-powered startup idea generation platform that combines market research, trend analysis, and competitive intelligence to create validated business opportunities. The platform uses a multi-agent AI system to generate, analyze, and score startup ideas with comprehensive market validation.

### Key Features

- **AI-Powered Idea Generation**: Multi-agent system with 8 specialized agents
- **Real-time Market Analysis**: Trend research, competitive intelligence, and validation
- **Subscription Management**: Tiered access with Stripe integration
- **Admin Dashboard**: Featured nuggets scheduling and prompt management
- **Semantic Search**: Advanced search capabilities across ideas
- **Progressive Web App**: PWA features with offline capabilities

### Business Model

- **Free Tier**: Limited access to basic idea overviews
- **Premium Tier**: Full access to all features including detailed analysis, execution plans, and AI chat
- **Admin Features**: Role-based access for content management and system configuration

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: Version 18+ (Bun runtime recommended)
- **PostgreSQL**: Version 14+
- **Git**: For version control
- **Stripe Account**: For payment processing
- **OpenRouter API Key**: For AI model access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nugget-finder

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
bun db:push

# Start development servers
bun dev
```

### Access Points

- **Web Application**: http://localhost:3001
- **API Server**: http://localhost:3000
- **Database Studio**: `bun db:studio`

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Web App] --> B[Components]
        B --> C[State Management]
        C --> D[API Client]
    end
    
    subgraph "Backend (Elysia + tRPC)"
        E[API Server] --> F[tRPC Router]
        F --> G[Authentication]
        F --> H[Idea Generation]
        F --> I[Subscription]
        F --> J[Admin]
    end
    
    subgraph "AI System"
        K[Multi-Agent System] --> L[Trend Research]
        K --> M[Problem Gap Analysis]
        K --> N[Competitive Intelligence]
        K --> O[Idea Synthesis]
        K --> P[Monetization]
        K --> Q[What to Build]
    end
    
    subgraph "External Services"
        R[PostgreSQL] --> S[Prisma ORM]
        T[Stripe] --> U[Payment Processing]
        V[OpenRouter] --> W[AI Models]
        X[Trigger.dev] --> Y[Background Jobs]
    end
    
    D --> E
    H --> K
    G --> S
    I --> T
    K --> V
    H --> X
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | Next.js | 15.3.0 | React framework with SSR |
| **Backend** | Elysia | 1.2.25 | TypeScript web framework |
| **API Layer** | tRPC | 11.4.2 | End-to-end type-safe APIs |
| **Database** | PostgreSQL | 14+ | Primary database |
| **ORM** | Prisma | 6.12.0 | Database client and migrations |
| **Authentication** | Better Auth | 1.3.4 | User authentication |
| **Payments** | Stripe | 18.3.0 | Subscription management |
| **AI Models** | OpenRouter | Latest | AI model access |
| **Background Jobs** | Trigger.dev | 3.3.17 | Scheduled tasks |
| **Styling** | Tailwind CSS | 4.1.10 | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Component library |
| **Runtime** | Bun | 1.2.2 | JavaScript runtime |
| **Package Manager** | Bun | 1.2.2 | Dependency management |

## 🛠️ Development Setup

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nugget_finder"
DIRECT_URL="postgresql://username:password@localhost:5432/nugget_finder"

# Authentication
AUTH_SECRET="your-auth-secret"
AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AI Models
OPENROUTER_API_KEY="your-openrouter-api-key"

# Trigger.dev
TRIGGER_API_KEY="your-trigger-api-key"
TRIGGER_API_URL="https://api.trigger.dev"

# Application
NEXT_PUBLIC_SITE_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3001"
```

### Database Setup

```bash
# Generate Prisma client
bun db:generate

# Push schema to database
bun db:push

# Run migrations (if needed)
bun db:migrate

# Open database studio
bun db:studio
```

### Development Commands

```bash
# Start all services
bun dev

# Start specific services
bun dev:web      # Frontend only
bun dev:server   # Backend only

# Database operations
bun db:push      # Push schema changes
bun db:studio    # Open database UI
bun db:generate  # Generate Prisma client
bun db:migrate   # Run migrations

# Code quality
bun check        # Run Biome linting/formatting
bun check-types  # TypeScript type checking

# Build
bun build        # Build all applications
```

## 🎯 Core Features

### 1. AI-Powered Idea Generation

The platform uses a sophisticated multi-agent system with 8 specialized agents:

1. **Master Research Director** - Orchestrates the entire generation process
2. **Trend Research Agent** - Analyzes market trends and opportunities
3. **Problem Gap Agent** - Identifies market gaps and problems
4. **Competitive Intelligence Agent** - Analyzes competition and positioning
5. **Idea Synthesis Agent** - Combines research into coherent ideas
6. **Monetization Agent** - Develops revenue models and pricing
7. **What to Build Agent** - Provides technical implementation guidance
8. **Critic Agent** - Evaluates and scores ideas

### 2. Subscription System

- **Free Tier**: Limited access to basic idea overviews
- **Premium Tier**: Full access to all features
- **Usage Limits**: Configurable limits for claims, saves, and views
- **Stripe Integration**: Secure payment processing

### 3. Admin Dashboard

- **Featured Nuggets Scheduling**: Calendar-based scheduling system
- **Feature Visibility Controls**: Manage free vs paid feature access
- **Prompt Management**: Dynamic AI prompt editing
- **User Management**: Admin user roles and permissions

### 4. Semantic Search

Advanced search capabilities across:
- Idea titles and descriptions
- Market analysis data
- Competitive intelligence
- Technical implementation details

## 📚 API Reference

### Authentication Endpoints

```typescript
// Sign up
POST /auth/sign-up
{
  "email": "user@example.com",
  "password": "password123"
}

// Sign in
POST /auth/sign-in
{
  "email": "user@example.com",
  "password": "password123"
}

// Sign out
POST /auth/sign-out
```

### Idea Generation Endpoints

```typescript
// Get daily ideas
GET /trpc/agents.getDailyIdeas
{
  "limit": 10,
  "offset": 0
}

// Get idea by ID
GET /trpc/agents.getIdeaById
{
  "id": "idea-uuid"
}

// Generate custom idea
POST /trpc/agents.generateCustomIdea
{
  "prompt": "AI-powered productivity tool",
  "personalizationData": {...}
}
```

### Subscription Endpoints

```typescript
// Get subscription status
GET /trpc/subscription.getStatus

// Create checkout session
POST /trpc/subscription.createCheckoutSession
{
  "planId": "price_xxx"
}

// Manage subscription
POST /trpc/subscription.manageSubscription
```

### Admin Endpoints

```typescript
// Get featured schedule
GET /trpc/admin.getFeaturedSchedule
{
  "date": "2024-01-15"
}

// Update featured schedule
POST /trpc/admin.updateFeaturedSchedule
{
  "date": "2024-01-15",
  "ideaIds": ["id1", "id2", "id3"]
}

// Get feature visibility defaults
GET /trpc/admin.getFeatureVisibilityDefaults

// Update feature visibility
POST /trpc/admin.updateFeatureVisibilityDefaults
{
  "isFreeQuickOverview": true,
  "isFreeWhyThisMatters": false,
  // ... other settings
}
```

## 🚀 Deployment Guide

### Production Environment Setup

1. **Database Setup**
   ```bash
   # Set up PostgreSQL on your server
   # Create production database
   # Configure connection pooling
   ```

2. **Environment Variables**
   ```bash
   # Production environment variables
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="production-secret"
   STRIPE_SECRET_KEY="sk_live_..."
   # ... other production variables
   ```

3. **Build and Deploy**
   ```bash
   # Build applications
   bun build
   
   # Deploy to your hosting platform
   # Configure reverse proxy (nginx)
   # Set up SSL certificates
   ```

### Monitoring and Maintenance

- **Logs**: Monitor application logs for errors
- **Database**: Regular backups and performance monitoring
- **AI Costs**: Monitor OpenRouter API usage
- **Stripe**: Monitor payment processing and webhooks

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   bun db:studio
   
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **Authentication Problems**
   ```bash
   # Check auth configuration
   # Verify AUTH_SECRET is set
   # Check CORS settings
   ```

3. **AI Generation Failures**
   ```bash
   # Check OpenRouter API key
   # Verify API quota
   # Check prompt configuration
   ```

4. **Payment Issues**
   ```bash
   # Verify Stripe keys
   # Check webhook configuration
   # Monitor Stripe dashboard
   ```

### Performance Optimization

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Optimize Prisma queries
   - Use connection pooling

2. **Caching Strategy**
   - Cache generated ideas
   - Cache user preferences
   - Use CDN for static assets

3. **AI Cost Optimization**
   - Implement prompt caching
   - Use cheaper models for simple tasks
   - Batch similar requests

## 📖 Additional Resources

- [Better-T-Stack Documentation](https://github.com/AmanVarshney01/create-better-t-stack)
- [Elysia Documentation](https://elysiajs.com/)
- [tRPC Documentation](https://trpc.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Trigger.dev Documentation](https://trigger.dev/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Nugget Finder Team





