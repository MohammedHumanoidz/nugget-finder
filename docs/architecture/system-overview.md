# System Architecture Overview

Nugget Finder is built as a modern full-stack application with a clear separation between frontend, backend, and external services. The system is designed for scalability, maintainability, and optimal performance.

## 🏗️ Architecture Principles

The Nugget Finder platform is built on modern, scalable architecture principles:

- **Type Safety**: End-to-end TypeScript with tRPC for type-safe APIs
- **Modularity**: Monorepo structure with clear separation of concerns
- **Scalability**: Microservices-ready architecture with background job processing
- **Security**: Role-based access control and secure authentication
- **Performance**: Optimized database queries and caching strategies

## 📊 System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[PWA Cache]
        A --> C[Service Worker]
    end
    
    subgraph "Frontend (Next.js 15)"
        D[Pages] --> E[Components]
        E --> F[State Management]
        F --> G[tRPC Client]
        H[Admin Dashboard] --> E
    end
    
    subgraph "API Gateway (Elysia)"
        I[HTTP Server] --> J[CORS Middleware]
        J --> K[Authentication]
        K --> L[tRPC Router]
    end
    
    subgraph "Business Logic Layer"
        M[Agent Router] --> N[Idea Generation]
        M --> O[Subscription]
        M --> P[Admin]
        M --> Q[Search]
    end
    
    subgraph "AI Agent System"
        R[Master Research Director] --> S[Trend Research Agent]
        R --> T[Problem Gap Agent]
        R --> U[Competitive Intelligence Agent]
        R --> V[Idea Synthesis Agent]
        R --> W[Monetization Agent]
        R --> X[What to Build Agent]
        R --> Y[Critic Agent]
    end
    
    subgraph "Data Layer"
        Z[Prisma ORM] --> AA[PostgreSQL]
        BB[Redis Cache] --> CC[Session Store]
    end
    
    subgraph "External Services"
        DD[Stripe API] --> EE[Payment Processing]
        FF[OpenRouter API] --> GG[AI Models]
        HH[Trigger.dev] --> II[Background Jobs]
    end
    
    G --> L
    L --> M
    N --> R
    K --> Z
    O --> DD
    R --> FF
    N --> HH
```

## 🔄 Data Flow Architecture

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Server
    participant D as Database
    
    U->>F: Sign In
    F->>A: POST /auth/sign-in
    A->>D: Validate Credentials
    D->>A: User Data
    A->>F: Session Token
    F->>U: Redirect to Dashboard
```

### 2. Idea Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant M as Master Agent
    participant S as Sub Agents
    participant AI as AI Models
    participant D as Database
    
    U->>F: Request Idea Generation
    F->>A: POST /trpc/agents.generateCustomIdea
    A->>M: Initialize Generation
    M->>S: Delegate Tasks
    S->>AI: Process with AI Models
    AI->>S: Return Results
    S->>M: Compile Results
    M->>D: Save Generated Idea
    D->>A: Return Idea Data
    A->>F: Return Response
    F->>U: Display Results
```

### 3. Subscription Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Stripe
    participant D as Database
    
    U->>F: Subscribe to Premium
    F->>A: POST /trpc/subscription.createCheckoutSession
    A->>S: Create Checkout Session
    S->>A: Session URL
    A->>F: Return Session
    F->>U: Redirect to Stripe
    U->>S: Complete Payment
    S->>A: Webhook Notification
    A->>D: Update Subscription
    A->>F: Update UI
```

## 🗄️ Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image
        string role
        int claimLimit
        int claimsUsed
        int saveLimit
        int savesUsed
        int viewLimit
        int viewsUsed
        datetime lastViewReset
        datetime createdAt
        datetime updatedAt
    }
    
    DailyIdea {
        string id PK
        string title
        string description
        string executiveSummary
        string problemSolution
        string problemStatement
        int innovationLevel
        int timeToMarket
        int confidenceScore
        string narrativeHook
        string[] targetKeywords
        int urgencyLevel
        int executionComplexity
        string[] tags
        boolean isFreeQuickOverview
        boolean isFreeWhyThisMatters
        boolean isFreeDetailedOverview
        boolean isFreeTheClaimWhyNow
        boolean isFreeWhatToBuild
        boolean isFreeExecutionPlan
        boolean isFreeMarketGap
        boolean isFreeCompetitiveLandscape
        boolean isFreeRevenueModel
        boolean isFreeExecutionValidation
        boolean isFreeChat
        datetime createdAt
        datetime updatedAt
    }
    
    Subscription {
        string id PK
        string plan
        string referenceId FK
        string stripeCustomerId
        string stripeSubscriptionId
        string status
        datetime periodStart
        datetime periodEnd
        boolean cancelAtPeriodEnd
        int seats
        datetime trialStart
        datetime trialEnd
        datetime createdAt
        datetime updatedAt
    }
    
    IdeaScore {
        string id PK
        int totalScore
        int problemSeverity
        int founderMarketFit
        int technicalFeasibility
        int monetizationPotential
        int urgencyScore
        int marketTimingScore
        int executionDifficulty
        int moatStrength
        int regulatoryRisk
        datetime createdAt
        datetime updatedAt
    }
    
    MarketOpportunity {
        string id PK
        int marketOpportunityScore
        int validationStrength
        int totalMarketSize
        int reachableMarketSize
        int realisticMarketSize
        int growthRate
        int adoptionRate
        string marketMaturityLevel
        string marketAnalysisSummary
        datetime createdAt
        datetime updatedAt
    }
    
    MonetizationStrategy {
        string id PK
        string primaryModel
        string pricingStrategy
        float businessScore
        int confidence
        string revenueModelValidation
        string pricingSensitivity
        datetime createdAt
        datetime updatedAt
    }
    
    User ||--o{ Subscription : has
    User ||--o{ SavedIdeas : saves
    User ||--o{ ClaimedIdeas : claims
    User ||--o{ ViewedIdeas : views
    DailyIdea ||--o| IdeaScore : scored_by
    DailyIdea ||--o| MarketOpportunity : analyzed_by
    DailyIdea ||--o| MonetizationStrategy : monetized_by
    DailyIdea ||--o{ SavedIdeas : saved_in
    DailyIdea ||--o{ ClaimedIdeas : claimed_in
    DailyIdea ||--o{ ViewedIdeas : viewed_in
```

### Database Indexing Strategy

```sql
-- Performance indexes for common queries
CREATE INDEX idx_daily_idea_created_at ON "DailyIdea"("createdAt" DESC);
CREATE INDEX idx_daily_idea_confidence_score ON "DailyIdea"("confidenceScore" DESC);
CREATE INDEX idx_daily_idea_tags ON "DailyIdea" USING GIN("tags");
CREATE INDEX idx_user_email ON "User"("email");
CREATE INDEX idx_subscription_status ON "Subscription"("status");
CREATE INDEX idx_saved_ideas_user_idea ON "SavedIdeas"("userId", "ideaId");
CREATE INDEX idx_claimed_ideas_user ON "ClaimedIdeas"("userId");
```

## 🤖 AI Agent Architecture

### Multi-Agent System Design

The platform uses a sophisticated multi-agent system with specialized roles:

```mermaid
graph TB
    subgraph "Orchestration Layer"
        A[Master Research Director] --> B[Agent Coordinator]
        B --> C[Progress Tracker]
        B --> D[Quality Controller]
    end
    
    subgraph "Research Agents"
        E[Trend Research Agent] --> F[Market Trends]
        E --> G[Technology Trends]
        E --> H[Social Trends]
    end
    
    subgraph "Analysis Agents"
        I[Problem Gap Agent] --> J[Problem Identification]
        I --> K[Market Gaps]
        I --> L[Opportunity Analysis]
    end
    
    subgraph "Intelligence Agents"
        M[Competitive Intelligence Agent] --> N[Competitor Analysis]
        M --> O[Market Positioning]
        M --> P[Competitive Advantages]
    end
    
    subgraph "Synthesis Agents"
        Q[Idea Synthesis Agent] --> R[Idea Generation]
        Q --> S[Concept Validation]
        Q --> T[Market Fit Analysis]
    end
    
    subgraph "Business Agents"
        U[Monetization Agent] --> V[Revenue Models]
        U --> W[Pricing Strategies]
        U --> X[Financial Projections]
    end
    
    subgraph "Technical Agents"
        Y[What to Build Agent] --> Z[Technical Architecture]
        Y --> AA[Implementation Plan]
        Y --> BB[Technology Stack]
    end
    
    subgraph "Evaluation Agents"
        CC[Critic Agent] --> DD[Idea Scoring]
        CC --> EE[Risk Assessment]
        CC --> FF[Feasibility Analysis]
    end
    
    A --> E
    A --> I
    A --> M
    A --> Q
    A --> U
    A --> Y
    A --> CC
```

### Agent Communication Protocol

```typescript
interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'error';
  data: any;
  timestamp: Date;
  correlationId: string;
}

interface AgentContext {
  sessionId: string;
  userId?: string;
  requestId: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: Record<string, any>;
}
```

## 🔐 Security Architecture

### Authentication & Authorization

```mermaid
graph TB
    subgraph "Authentication Flow"
        A[User Request] --> B{Has Valid Session?}
        B -->|Yes| C[Allow Access]
        B -->|No| D[Redirect to Login]
        D --> E[User Login]
        E --> F[Create Session]
        F --> G[Set Cookies]
        G --> C
    end
    
    subgraph "Authorization Flow"
        C --> H{Check Permissions}
        H -->|Admin| I[Admin Routes]
        H -->|Premium| J[Premium Features]
        H -->|Free| K[Free Features]
    end
    
    subgraph "Rate Limiting"
        L[Request] --> M{Within Limits?}
        M -->|Yes| N[Process Request]
        M -->|No| O[Rate Limited]
    end
```

### Security Measures

1. **Authentication**
   - Better Auth with secure session management
   - JWT tokens with short expiration
   - CSRF protection
   - Secure cookie settings

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API rate limiting
   - Input validation and sanitization

3. **Data Protection**
   - Database encryption at rest
   - HTTPS/TLS for all communications
   - Secure API key management
   - Regular security audits

## 📈 Performance Architecture

### Caching Strategy

```mermaid
graph TB
    subgraph "Cache Layers"
        A[Browser Cache] --> B[CDN Cache]
        B --> C[Application Cache]
        C --> D[Database Cache]
    end
    
    subgraph "Cache Types"
        E[Static Assets] --> F[Images, CSS, JS]
        G[API Responses] --> H[Idea Data, User Data]
        I[Database Queries] --> J[Frequent Queries]
        K[AI Results] --> L[Generated Ideas]
    end
```

### Performance Optimizations

1. **Frontend Optimizations**
   - Code splitting and lazy loading
   - Image optimization and WebP format
   - Service worker for offline functionality
   - React.memo for component optimization

2. **Backend Optimizations**
   - Database query optimization
   - Connection pooling
   - Background job processing
   - API response caching

3. **Database Optimizations**
   - Strategic indexing
   - Query optimization
   - Read replicas for scaling
   - Connection pooling

## 🔄 Background Job Architecture

### Trigger.dev Integration

```mermaid
graph TB
    subgraph "Scheduled Jobs"
        A[Daily Idea Generation] --> B[Generate 3 Ideas]
        C[Weekly Analytics] --> D[Generate Reports]
        E[Monthly Cleanup] --> F[Clean Old Data]
    end
    
    subgraph "On-Demand Jobs"
        G[Custom Idea Generation] --> H[User Request]
        I[Email Notifications] --> J[User Actions]
        K[Data Processing] --> L[Bulk Operations]
    end
    
    subgraph "Job Processing"
        M[Job Queue] --> N[Worker Pool]
        N --> O[Job Execution]
        O --> P[Result Storage]
        P --> Q[Status Update]
    end
```

### Job Types and Scheduling

```typescript
interface JobDefinition {
  name: string;
  schedule?: string; // Cron expression
  handler: (payload: any) => Promise<void>;
  retries: number;
  timeout: number;
  concurrency: number;
}

const jobs: JobDefinition[] = [
  {
    name: 'daily-idea-generation',
    schedule: '0 6 * * *', // Daily at 6 AM
    handler: generateDailyIdeas,
    retries: 3,
    timeout: 3600,
    concurrency: 1
  },
  {
    name: 'on-demand-idea-generation',
    handler: generateCustomIdea,
    retries: 2,
    timeout: 1800,
    concurrency: 5
  }
];
```

## 🚀 Scalability Considerations

### Horizontal Scaling

1. **Application Scaling**
   - Stateless API design
   - Load balancer configuration
   - Auto-scaling groups
   - Container orchestration (Docker/Kubernetes)

2. **Database Scaling**
   - Read replicas for read-heavy workloads
   - Connection pooling
   - Query optimization
   - Database sharding (future)

3. **AI Service Scaling**
   - Model caching
   - Request batching
   - Fallback models
   - Cost optimization

### Monitoring and Observability

```mermaid
graph TB
    subgraph "Monitoring Stack"
        A[Application Metrics] --> B[Prometheus]
        C[Log Aggregation] --> D[ELK Stack]
        E[Error Tracking] --> F[Sentry]
        G[Performance Monitoring] --> H[New Relic]
    end
    
    subgraph "Alerting"
        I[High Error Rate] --> J[PagerDuty]
        K[High Response Time] --> L[Slack]
        M[Database Issues] --> N[Email]
    end
```

This architecture provides a solid foundation for the Nugget Finder platform, ensuring scalability, security, and maintainability as the application grows.


