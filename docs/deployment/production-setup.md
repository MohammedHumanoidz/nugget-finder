# Production Deployment Guide

This guide covers deploying Nugget Finder to production environments with considerations for scalability, security, and reliability.

## Deployment Architecture

```mermaid
graph TB
    subgraph "CDN & Load Balancing"
        CDN[CloudFlare CDN]
        LB[Load Balancer]
    end
    
    subgraph "Frontend Deployment"
        Vercel[Vercel Deployment]
        Static[Static Assets]
        SSR[Server-Side Rendering]
    end
    
    subgraph "Backend Services"
        API[API Server - Railway/Heroku]
        Workers[Background Workers]
        Queue[Job Queue - Trigger.dev]
    end
    
    subgraph "Database & Storage"
        PostgreSQL[(PostgreSQL Database)]
        Redis[(Redis Cache)]
        S3[File Storage - AWS S3]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        Claude[Claude API]
        Stripe[Stripe Payments]
        Resend[Resend Email]
    end
    
    CDN --> Vercel
    LB --> API
    API --> PostgreSQL
    API --> Redis
    API --> Queue
    Workers --> Queue
    API --> OpenAI
    API --> Claude
    API --> Stripe
```

## Environment Setup

### Production Environment Variables

#### Server Environment (apps/server/.env)
```env
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database"
DIRECT_URL="postgresql://username:password@hostname:port/database"

# AI Services
OPENAI_API_KEY="sk-proj-your-production-openai-key"
CLAUDE_API_KEY="sk-ant-your-production-claude-key"

# Authentication
BETTER_AUTH_SECRET="your-secure-production-secret-32-chars-min"
BETTER_AUTH_URL="https://api.yourdomain.com"

# Stripe (Live Keys)
STRIPE_SECRET_KEY="sk_live_your_production_stripe_secret"
STRIPE_PUBLISHABLE_KEY="pk_live_your_production_stripe_publishable"
STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"

# Background Jobs
TRIGGER_SECRET_KEY="tr_prod_your_production_trigger_key"

# OAuth Providers (Production)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GITHUB_CLIENT_ID="your-production-github-client-id"
GITHUB_CLIENT_SECRET="your-production-github-client-secret"

# Email Service
RESEND_API_KEY="re_your-production-resend-key"
EMAIL_FROM="noreply@yourdomain.com"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn.ingest.sentry.io/project-id"

# Production Settings
NODE_ENV="production"
PORT="3001"
CORS_ORIGIN="https://yourdomain.com"

# Security
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX="100"           # Max requests per window
```

#### Web Environment (apps/web/.env)
```env
# API Configuration
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_production_stripe_publishable"

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_POSTHOG_KEY="phc_your_posthog_key"

# Production Settings
NODE_ENV="production"
```

## Database Setup

### PostgreSQL Production Configuration

#### 1. Database Provider Setup

**Option A: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Add PostgreSQL service
railway add postgresql

# Get connection URL
railway variables
```

**Option B: Supabase**
```bash
# Create project at https://supabase.com
# Navigate to Settings -> Database
# Copy connection string
```

**Option C: PlanetScale**
```bash
# Install PlanetScale CLI
curl -fsSL https://get.planetscale.com | sh

# Create database
pscale database create nuggetfinder --region us-east

# Create production branch
pscale branch create nuggetfinder production

# Get connection URL
pscale password create nuggetfinder production mypassword
```

#### 2. Database Migration

```bash
# Set production database URL
export DATABASE_URL="postgresql://..."

# Run migrations
cd apps/server
bun db:deploy

# Verify migration
bun db:studio
```

#### 3. Database Optimization

```sql
-- Production performance settings
-- Connection settings
SET max_connections = 100;
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET work_mem = '4MB';

-- Enable query logging (for monitoring)
SET log_statement = 'all';
SET log_duration = on;
SET log_min_duration_statement = 1000; -- Log slow queries (1s+)

-- Create indexes for production
CREATE INDEX CONCURRENTLY idx_user_email ON "User"("email");
CREATE INDEX CONCURRENTLY idx_daily_idea_created_at ON "DailyIdea"("createdAt" DESC);
CREATE INDEX CONCURRENTLY idx_daily_idea_confidence_score ON "DailyIdea"("confidenceScore" DESC);
CREATE INDEX CONCURRENTLY idx_daily_idea_tags ON "DailyIdea" USING GIN("tags");

-- Analyze tables for query optimization
ANALYZE "User";
ANALYZE "DailyIdea";
ANALYZE "Subscription";
```

## Backend Deployment

### Option A: Railway Deployment

#### 1. Setup Railway Project
```bash
# Connect to Railway
railway login
railway link

# Add environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set OPENAI_API_KEY="sk-proj-..."
railway variables set STRIPE_SECRET_KEY="sk_live_..."
# ... add all production variables

# Deploy
railway up
```

#### 2. Custom Railway Configuration

**railway.json**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "buildCommand": "bun install && bun run build"
  },
  "deploy": {
    "startCommand": "bun start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option B: Heroku Deployment

#### 1. Heroku Setup
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create nuggetfinder-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Add Redis addon (optional)
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set OPENAI_API_KEY="sk-proj-..."
heroku config:set STRIPE_SECRET_KEY="sk_live_..."
# ... set all production variables
```

#### 2. Heroku Configuration

**Procfile**:
```
web: cd apps/server && bun start
worker: cd apps/server && bun worker
```

**package.json** (root):
```json
{
  "scripts": {
    "heroku-postbuild": "bun install && bun run build"
  },
  "engines": {
    "node": "18.x",
    "bun": "1.x"
  }
}
```

### Option C: Docker Deployment

#### 1. Docker Configuration

**Dockerfile**:
```dockerfile
# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:latest AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["bun", "start"]
```

**docker-compose.yml** (for local testing):
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/nuggetfinder
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=nuggetfinder
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Frontend Deployment

### Vercel Deployment (Recommended)

#### 1. Vercel Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Deploy to production
vercel --prod
```

#### 2. Vercel Configuration

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next",
      "config": {
        "projectSettings": {
          "framework": "nextjs"
        }
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Alternative: Netlify Deployment

#### 1. Netlify Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and init
netlify login
netlify init

# Build and deploy
netlify build
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  publish = "apps/web/.next"
  command = "cd apps/web && bun run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

## External Services Configuration

### Stripe Production Setup

#### 1. Stripe Dashboard Configuration
1. Switch to Live mode in Stripe Dashboard
2. Create Products and Prices for subscription plans:
   ```
   - Basic Plan: $29/month
   - Pro Plan: $99/month  
   - Enterprise Plan: $299/month
   ```
3. Configure webhooks endpoint: `https://api.yourdomain.com/webhooks/stripe`
4. Enable webhook events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

#### 2. Webhook Security
```typescript
// apps/server/src/webhooks/stripe.ts
import { stripe } from '@/lib/stripe';

export async function verifyStripeWebhook(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}
```

### OpenAI and Claude API Setup

#### 1. Production API Keys
- Use organization-level API keys for production
- Set up billing alerts and usage limits
- Monitor API costs and usage patterns

#### 2. Rate Limiting and Error Handling
```typescript
// apps/server/src/lib/ai/rate-limiter.ts
export class APIRateLimiter {
  private queues: Map<string, Array<() => Promise<any>>> = new Map();
  private processing: Set<string> = new Set();

  async enqueue<T>(
    provider: 'openai' | 'claude',
    operation: () => Promise<T>
  ): Promise<T> {
    const queue = this.queues.get(provider) || [];
    
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.queues.set(provider, queue);
      this.processQueue(provider);
    });
  }

  private async processQueue(provider: string) {
    if (this.processing.has(provider)) return;
    
    this.processing.add(provider);
    const queue = this.queues.get(provider) || [];
    
    while (queue.length > 0) {
      const operation = queue.shift()!;
      try {
        await operation();
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`API operation failed for ${provider}:`, error);
      }
    }
    
    this.processing.delete(provider);
  }
}
```

## Security Configuration

### SSL/TLS Setup

#### 1. Domain and SSL Certificate
- Purchase domain from registrar (Namecheap, GoDaddy, etc.)
- Use CloudFlare for DNS management and SSL
- Enable "Always Use HTTPS" in CloudFlare

#### 2. Security Headers
```typescript
// apps/server/src/middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.openai.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

### Environment Security

#### 1. Secret Management
```bash
# Use a secrets management service
# Option A: HashiCorp Vault
# Option B: AWS Secrets Manager
# Option C: Railway/Heroku Config Vars

# Never commit .env files
echo ".env*" >> .gitignore

# Use different secrets for each environment
DATABASE_URL_DEV="postgresql://localhost/nuggetfinder_dev"
DATABASE_URL_PROD="postgresql://prod-host/nuggetfinder_prod"
```

#### 2. API Security
```typescript
// Rate limiting by user
import rateLimit from 'express-rate-limit';

export const createUserRateLimit = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
  });

// Apply different limits for different endpoints
app.use('/api/ideas/generate', createUserRateLimit(60 * 1000, 5)); // 5 per minute
app.use('/api/user', createUserRateLimit(60 * 1000, 30)); // 30 per minute
```

## Monitoring and Observability

### Application Monitoring

#### 1. Error Tracking with Sentry
```bash
npm install @sentry/node @sentry/nextjs
```

**apps/server/src/lib/sentry.ts**:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export { Sentry };
```

#### 2. Performance Monitoring
```typescript
// apps/server/src/middleware/monitoring.ts
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 5000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};
```

### Health Checks

```typescript
// apps/server/src/routes/health.ts
export async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalAPIs(),
  ]);

  return {
    status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: checks[0].status === 'fulfilled' ? 'up' : 'down',
      redis: checks[1].status === 'fulfilled' ? 'up' : 'down',
      externalAPIs: checks[2].status === 'fulfilled' ? 'up' : 'down',
    },
    version: process.env.npm_package_version || 'unknown',
  };
}

async function checkDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

async function checkExternalAPIs(): Promise<void> {
  // Test API connections with timeout
  await Promise.race([
    fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    ),
  ]);
}
```

## Performance Optimization

### Caching Strategy

#### 1. Redis Setup
```bash
# Railway
railway add redis

# Heroku
heroku addons:create heroku-redis:premium-0
```

#### 2. Application Caching
```typescript
// apps/server/src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Cache expensive operations
export const cache = new CacheService();

// Example usage in AI agent calls
export async function getCachedAgentResult(
  agentName: string,
  input: string
): Promise<any> {
  const cacheKey = `agent:${agentName}:${hashInput(input)}`;
  
  let result = await cache.get(cacheKey);
  if (!result) {
    result = await executeAgent(agentName, input);
    await cache.set(cacheKey, result, 3600); // Cache for 1 hour
  }
  
  return result;
}
```

### Database Optimization

#### 1. Connection Pooling
```typescript
// apps/server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Configure connection pool
prisma.$connect();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

#### 2. Query Optimization
```sql
-- Add production indexes
CREATE INDEX CONCURRENTLY idx_user_stripe_customer_id 
ON "User"("stripeCustomerId") 
WHERE "stripeCustomerId" IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_subscription_status_plan 
ON "Subscription"("status", "plan");

CREATE INDEX CONCURRENTLY idx_daily_idea_featured 
ON "DailyIdea"("confidenceScore" DESC) 
WHERE "confidenceScore" >= 7;

-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM "DailyIdea" 
WHERE "confidenceScore" >= 8 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

## Backup and Recovery

### Database Backups

#### 1. Automated Backups
```bash
# Railway - automatic backups enabled
railway backup create

# Heroku Postgres - automatic backups
heroku pg:backups:capture

# Manual backup script
#!/bin/bash
BACKUP_NAME="nuggetfinder_backup_$(date +%Y%m%d_%H%M%S)"
pg_dump $DATABASE_URL > "/backups/${BACKUP_NAME}.sql"
aws s3 cp "/backups/${BACKUP_NAME}.sql" s3://your-backup-bucket/
```

#### 2. Point-in-Time Recovery
```sql
-- Create a recovery point
SELECT pg_create_restore_point('before_major_update');

-- Restore to a specific time (if needed)
-- This would be done during database recovery
```

### Disaster Recovery Plan

#### 1. Recovery Checklist
- [ ] Database backup restoration
- [ ] Environment variables configuration
- [ ] SSL certificate setup
- [ ] DNS configuration
- [ ] External service reconnection
- [ ] Health check validation

#### 2. Recovery Scripts
```bash
#!/bin/bash
# disaster-recovery.sh

# 1. Deploy infrastructure
railway up

# 2. Restore database
pg_restore -d $DATABASE_URL latest_backup.sql

# 3. Set environment variables
railway variables set $(cat .env.prod)

# 4. Verify deployment
curl -f https://api.yourdomain.com/health || exit 1

echo "Recovery completed successfully"
```

## Scaling Considerations

### Horizontal Scaling

#### 1. Load Balancing
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api:
    image: nuggetfinder/api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
```

#### 2. Database Read Replicas
```typescript
// Multiple database connections
const primaryDb = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const readonlyDb = new PrismaClient({
  datasources: { db: { url: process.env.READONLY_DATABASE_URL } }
});

// Use read replica for queries
export async function getIdeas() {
  return readonlyDb.dailyIdea.findMany();
}

// Use primary for writes
export async function createIdea(data: any) {
  return primaryDb.dailyIdea.create({ data });
}
```

This production deployment guide ensures a robust, scalable, and secure deployment of the Nugget Finder platform.