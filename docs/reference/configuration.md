# Configuration Reference

Complete reference for all configuration options, environment variables, and settings used in the Nugget Finder platform.

## Environment Variables

### Server Configuration (apps/server/.env)

#### Database Configuration
```env
# Primary database connection
DATABASE_URL="postgresql://user:password@localhost:5432/nuggetfinder"

# Direct database URL (for connection pooling)
DIRECT_URL="postgresql://user:password@localhost:5432/nuggetfinder"

# Database connection pool settings
DATABASE_MAX_CONNECTIONS="10"
DATABASE_TIMEOUT="30000"
```

#### Authentication Configuration
```env
# Better Auth configuration
BETTER_AUTH_SECRET="your-secure-secret-key-32-characters-minimum"
BETTER_AUTH_URL="http://localhost:3001"  # Your API domain

# Session configuration
SESSION_EXPIRES_IN="604800"  # 1 week in seconds
SESSION_COOKIE_MAX_AGE="300"  # 5 minutes in seconds

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
```

#### AI Service Configuration
```env
# OpenAI Configuration
OPENAI_API_KEY="sk-proj-your-openai-api-key"
OPENAI_ORG_ID="org-your-organization-id"  # Optional
OPENAI_MAX_TOKENS="4000"
OPENAI_TEMPERATURE="0.7"
OPENAI_MODEL="gpt-4"

# Claude Configuration
CLAUDE_API_KEY="sk-ant-your-claude-api-key"
CLAUDE_MAX_TOKENS="4000"
CLAUDE_TEMPERATURE="0.7"
CLAUDE_MODEL="claude-3-sonnet-20240229"

# API Rate Limiting
AI_REQUEST_TIMEOUT="30000"  # 30 seconds
AI_MAX_RETRIES="3"
AI_RETRY_DELAY="1000"  # 1 second
```

#### Payment Processing
```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Stripe Product IDs
STRIPE_BASIC_PRICE_ID="price_basic_monthly"
STRIPE_PRO_PRICE_ID="price_pro_monthly"
STRIPE_ENTERPRISE_PRICE_ID="price_enterprise_monthly"

# Billing Configuration
DEFAULT_TRIAL_DAYS="14"
BILLING_GRACE_PERIOD_DAYS="3"
```

#### Background Jobs
```env
# Trigger.dev Configuration
TRIGGER_SECRET_KEY="tr_dev_your-trigger-secret-key"
TRIGGER_API_URL="https://api.trigger.dev"

# Job Configuration
IDEA_GENERATION_TIMEOUT="300000"  # 5 minutes
MAX_CONCURRENT_GENERATIONS="5"
JOB_RETRY_ATTEMPTS="3"
```

#### Email Configuration
```env
# Resend Email Service
RESEND_API_KEY="re_your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_REPLY_TO="support@yourdomain.com"

# Email Templates
EMAIL_VERIFICATION_TEMPLATE="email-verification"
PASSWORD_RESET_TEMPLATE="password-reset"
SUBSCRIPTION_CONFIRMATION_TEMPLATE="subscription-confirmation"
```

#### Application Settings
```env
# Server Configuration
NODE_ENV="development"  # development | production | test
PORT="3001"
HOST="0.0.0.0"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"  # Frontend domain
CORS_CREDENTIALS="true"

# Security Settings
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX="100"  # Max requests per window
BCRYPT_SALT_ROUNDS="12"
JWT_ALGORITHM="HS256"
```

#### Monitoring & Logging
```env
# Error Tracking
SENTRY_DSN="https://your-sentry-dsn.ingest.sentry.io/project-id"
SENTRY_ENVIRONMENT="development"
SENTRY_TRACES_SAMPLE_RATE="0.1"

# Logging Configuration
LOG_LEVEL="info"  # error | warn | info | debug
LOG_FORMAT="json"  # json | simple
LOG_FILE_PATH="./logs/app.log"

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING="true"
SLOW_QUERY_THRESHOLD="1000"  # Log queries slower than 1s
```

### Client Configuration (apps/web/.env)

#### API Configuration
```env
# API Endpoints
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# App Configuration
NEXT_PUBLIC_APP_NAME="Nugget Finder"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

#### Third-Party Services
```env
# Stripe (Client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_POSTHOG_KEY="phc_your_posthog_key"
NEXT_PUBLIC_HOTJAR_ID="your-hotjar-id"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_HOTJAR="false"
NEXT_PUBLIC_MAINTENANCE_MODE="false"
```

#### Development Settings
```env
# Next.js Configuration
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"  # Disable Next.js telemetry
ANALYZE="false"  # Enable bundle analyzer

# Development Tools
NEXT_PUBLIC_SHOW_DEBUG_INFO="true"
NEXT_PUBLIC_MOCK_PAYMENTS="false"
NEXT_PUBLIC_SKIP_AUTH="false"
```

## Application Configuration Files

### Next.js Configuration (apps/web/next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Public runtime configuration
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API proxying
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### Prisma Configuration (apps/server/prisma/schema.prisma)

```prisma
// Database configuration
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Client configuration
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol", "fullTextSearch"]
  engineType = "binary"
}
```

### Tailwind CSS Configuration (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ["class"],
}
```

## Feature Flags

### Server-side Feature Flags

```typescript
// apps/server/src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  // AI Features
  ENABLE_CLAUDE_AGENT: process.env.ENABLE_CLAUDE_AGENT === 'true',
  ENABLE_CUSTOM_IDEA_GENERATION: process.env.ENABLE_CUSTOM_IDEAS === 'true',
  AI_RESPONSE_CACHING: process.env.AI_RESPONSE_CACHING === 'true',
  
  // Payment Features
  ENABLE_STRIPE_PAYMENTS: process.env.ENABLE_STRIPE === 'true',
  ENABLE_TRIAL_PERIODS: process.env.ENABLE_TRIALS === 'true',
  
  // Admin Features
  ENABLE_ADMIN_DASHBOARD: process.env.ENABLE_ADMIN === 'true',
  ENABLE_PROMPT_MANAGEMENT: process.env.ENABLE_PROMPT_MGMT === 'true',
  
  // Performance Features
  ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS === 'true',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMIT === 'true',
  
  // Debug Features
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_QUERY_LOGGING: process.env.LOG_QUERIES === 'true',
} as const;

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}
```

### Client-side Feature Flags

```typescript
// apps/web/src/lib/feature-flags.ts
export const CLIENT_FEATURE_FLAGS = {
  // UI Features
  ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_DARK_MODE === 'true',
  ENABLE_ANIMATIONS: process.env.NEXT_PUBLIC_ANIMATIONS !== 'false',
  SHOW_BETA_FEATURES: process.env.NEXT_PUBLIC_BETA === 'true',
  
  // Analytics
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_HOTJAR: process.env.NEXT_PUBLIC_ENABLE_HOTJAR === 'true',
  
  // Development
  SHOW_DEBUG_INFO: process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO === 'true',
  MOCK_PAYMENTS: process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true',
  SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH === 'true',
  
  // Maintenance
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
} as const;
```

## AI Agent Configuration

### Agent Settings

```typescript
// apps/server/src/lib/agents/config.ts
export const AGENT_CONFIG = {
  // Model Configuration
  OPENAI: {
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
    timeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000'),
  },
  
  CLAUDE: {
    model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
    temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4000'),
    timeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000'),
  },
  
  // Agent-specific settings
  AGENTS: {
    TrendResearchAgent: {
      model: 'openai',
      timeout: 25000,
      retries: 3,
      cacheResults: true,
      cacheTTL: 3600, // 1 hour
    },
    
    IdeaSynthesisAgent: {
      model: 'claude',
      timeout: 30000,
      retries: 2,
      cacheResults: false,
    },
    
    MonetizationAgent: {
      model: 'openai',
      timeout: 20000,
      retries: 3,
      cacheResults: true,
      cacheTTL: 1800, // 30 minutes
    },
  },
  
  // Rate Limiting
  RATE_LIMITS: {
    requestsPerMinute: 10,
    requestsPerHour: 200,
    concurrentRequests: 3,
  },
} as const;
```

### Prompt Configuration

```typescript
// apps/server/src/lib/agents/prompts.ts
export const DEFAULT_PROMPTS = {
  TrendResearchAgent: {
    main_prompt: `
      You are a market research expert specializing in identifying emerging trends and opportunities.
      
      Analyze the following domain: "{prompt}"
      
      Research and identify:
      1. Current macro trends affecting this industry
      2. Emerging technology trends
      3. Consumer behavior shifts
      4. Market timing indicators
      5. Regulatory and policy changes
      
      Focus on trends that create business opportunities.
      Provide evidence and data points for each trend identified.
    `,
    
    follow_up_prompt: `
      Based on the trends identified, provide additional analysis on:
      1. Market timing and urgency
      2. Potential market disruptions
      3. Investment and funding trends
    `,
  },
  
  IdeaSynthesisAgent: {
    main_prompt: `
      You are the Trend Architect - a world-class startup idea synthesizer.
      
      Using the provided research data, generate innovative business ideas for: "{prompt}"
      
      Research Data:
      - Trends: {trendData}
      - Problems: {problemData}
      - Competitive Landscape: {competitiveData}
      
      Generate 3-5 business ideas that:
      1. Address identified problems and trends
      2. Exploit competitive gaps
      3. Have clear value propositions
      4. Are feasible to execute
      5. Have strong monetization potential
    `,
  },
} as const;
```

## Database Configuration

### Connection Pool Settings

```typescript
// apps/server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const databaseConfig = {
  // Connection pool settings
  connectionLimit: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
  
  // Query settings
  queryTimeout: parseInt(process.env.DATABASE_TIMEOUT || '30000'),
  
  // Logging
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  
  // Error formatting
  errorFormat: 'pretty' as const,
};

export const prisma = new PrismaClient(databaseConfig);
```

### Query Configuration

```sql
-- Production database settings
-- Connection settings
SET max_connections = 100;
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET work_mem = '4MB';
SET maintenance_work_mem = '64MB';

-- Query performance
SET random_page_cost = 1.1; -- For SSD storage
SET effective_io_concurrency = 200;
SET max_worker_processes = 4;
SET max_parallel_workers_per_gather = 2;
SET max_parallel_workers = 4;

-- Logging
SET log_statement = 'all';
SET log_duration = on;
SET log_min_duration_statement = 1000; -- Log slow queries (1s+)
```

## Security Configuration

### Security Headers

```typescript
// apps/server/src/middleware/security.ts
import helmet from 'helmet';

export const securityConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://www.googletagmanager.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://api.openai.com",
        "https://api.anthropic.com",
      ],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  crossOriginEmbedderPolicy: false, // For development
});
```

### Rate Limiting Configuration

```typescript
// apps/server/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const rateLimitConfig = {
  // General API rate limit
  general: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // Authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit to 10 requests per window
    skipSuccessfulRequests: true,
  }),
  
  // Idea generation (more restrictive)
  ideaGeneration: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 generations per minute
    keyGenerator: (req) => req.user?.id || req.ip,
  }),
  
  // Admin endpoints
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 requests per minute
  }),
};
```

## Monitoring Configuration

### Logging Configuration

```typescript
// apps/server/src/lib/logger.ts
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat === 'json' 
      ? winston.format.json()
      : winston.format.simple()
  ),
  defaultMeta: { 
    service: 'nuggetfinder-api',
    version: process.env.npm_package_version,
  },
  transports: [
    // Error log file
    new winston.transports.File({ 
      filename: process.env.LOG_FILE_PATH || './logs/error.log', 
      level: 'error' 
    }),
    
    // Combined log file
    new winston.transports.File({ 
      filename: process.env.LOG_FILE_PATH || './logs/combined.log' 
    }),
    
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});
```

### Performance Monitoring

```typescript
// apps/server/src/lib/monitoring.ts
export const monitoringConfig = {
  // Performance thresholds
  SLOW_QUERY_THRESHOLD: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'),
  SLOW_REQUEST_THRESHOLD: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '5000'),
  
  // Memory monitoring
  MEMORY_WARNING_THRESHOLD: 400 * 1024 * 1024, // 400MB
  MEMORY_CRITICAL_THRESHOLD: 500 * 1024 * 1024, // 500MB
  
  // Health check intervals
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  MEMORY_CHECK_INTERVAL: 60000, // 1 minute
  
  // Metrics collection
  COLLECT_REQUEST_METRICS: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
  COLLECT_DATABASE_METRICS: process.env.ENABLE_DB_MONITORING === 'true',
  COLLECT_AI_METRICS: process.env.ENABLE_AI_MONITORING === 'true',
};
```

This configuration reference covers all the major settings and options available in the Nugget Finder platform, providing a comprehensive guide for setup and customization.