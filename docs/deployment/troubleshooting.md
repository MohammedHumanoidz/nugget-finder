# Troubleshooting Guide

This guide helps diagnose and resolve common issues encountered during development and production deployment of Nugget Finder.

## Common Development Issues

### Database Connection Issues

#### Problem: "Cannot connect to database"
```
Error: P1001: Can't reach database server at `localhost`:`5432`
```

**Solutions:**
1. **Check PostgreSQL Status**
   ```bash
   # Mac
   brew services list | grep postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   
   # Windows
   net start postgresql-x64-14
   ```

2. **Verify Connection String**
   ```bash
   # Test connection
   psql $DATABASE_URL
   
   # Check environment variable
   echo $DATABASE_URL
   ```

3. **Create Database if Missing**
   ```bash
   createdb nuggetfinder
   # or
   psql -c "CREATE DATABASE nuggetfinder;"
   ```

#### Problem: "Database schema out of sync"
```
Error: P3009: Migrate could not create the shadow database
```

**Solutions:**
1. **Reset and Migrate**
   ```bash
   cd apps/server
   bun db:reset
   bun db:migrate
   ```

2. **Manual Schema Sync**
   ```bash
   bun db:push --accept-data-loss
   ```

3. **Check Migration Status**
   ```bash
   bun db:status
   ```

### Authentication Issues

#### Problem: "Session not found" or "Invalid session"
**Symptoms:** Users get logged out frequently, authentication doesn't persist

**Solutions:**
1. **Check Auth Configuration**
   ```typescript
   // Verify in apps/server/src/lib/auth.ts
   export const auth = betterAuth({
     database: prisma,
     session: {
       expiresIn: 60 * 60 * 24 * 7, // 1 week
       cookieCache: {
         enabled: true,
         maxAge: 5 * 60, // 5 minutes
       },
     },
     advanced: {
       useSecureCookies: process.env.NODE_ENV === "production",
     },
   });
   ```

2. **Environment Variables**
   ```bash
   # Check required variables
   echo $BETTER_AUTH_SECRET  # Should be 32+ characters
   echo $BETTER_AUTH_URL     # Should match your domain
   ```

3. **Clear Session Storage**
   ```bash
   # Clear browser storage
   # Or programmatically:
   localStorage.clear();
   sessionStorage.clear();
   ```

#### Problem: OAuth providers not working
**Symptoms:** "OAuth error" or redirect loops

**Solutions:**
1. **Verify OAuth Configuration**
   ```bash
   # Check provider credentials
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   echo $GITHUB_CLIENT_ID
   echo $GITHUB_CLIENT_SECRET
   ```

2. **Check Redirect URLs**
   - Google Console: `http://localhost:3001/api/auth/callback/google`
   - GitHub Settings: `http://localhost:3001/api/auth/callback/github`

3. **Debug OAuth Flow**
   ```typescript
   // Add logging in auth callback
   console.log('OAuth callback received:', req.query);
   ```

### AI Agent Issues

#### Problem: "OpenAI API key invalid" or "Rate limit exceeded"
```
Error: 401 Unauthorized - Incorrect API key provided
Error: 429 Too Many Requests - Rate limit exceeded
```

**Solutions:**
1. **Verify API Keys**
   ```bash
   # Test OpenAI key
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   
   # Test Claude key
   curl -H "x-api-key: $CLAUDE_API_KEY" \
        https://api.anthropic.com/v1/messages
   ```

2. **Check Usage Limits**
   - Visit OpenAI Platform dashboard
   - Check billing and usage
   - Upgrade plan if needed

3. **Implement Rate Limiting**
   ```typescript
   // Add exponential backoff
   export async function retryWithBackoff<T>(
     fn: () => Promise<T>,
     maxRetries: number = 3
   ): Promise<T> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => 
           setTimeout(resolve, Math.pow(2, i) * 1000)
         );
       }
     }
     throw new Error('Max retries exceeded');
   }
   ```

#### Problem: Agent execution timeouts
**Symptoms:** Ideas generation hangs or times out

**Solutions:**
1. **Increase Timeout Values**
   ```typescript
   // In agent configuration
   const AGENT_TIMEOUT = 30000; // 30 seconds
   
   export async function executeAgent(agentName: string, input: any) {
     return Promise.race([
       agent.execute(input),
       new Promise((_, reject) => 
         setTimeout(() => reject(new Error('Timeout')), AGENT_TIMEOUT)
       ),
     ]);
   }
   ```

2. **Add Progress Tracking**
   ```typescript
   // Track agent progress
   export class AgentProgressTracker {
     private progress = new Map<string, number>();
     
     updateProgress(sessionId: string, percentage: number) {
       this.progress.set(sessionId, percentage);
       // Emit progress update to frontend
     }
   }
   ```

3. **Implement Fallback Strategies**
   ```typescript
   export async function generateIdeaWithFallback(prompt: string) {
     try {
       return await fullAgentPipeline(prompt);
     } catch (error) {
       console.warn('Full pipeline failed, using simplified version');
       return await simplifiedIdeaGeneration(prompt);
     }
   }
   ```

### Subscription and Payment Issues

#### Problem: Stripe webhook verification fails
```
Error: Invalid signature for Stripe webhook
```

**Solutions:**
1. **Verify Webhook Secret**
   ```bash
   echo $STRIPE_WEBHOOK_SECRET  # Should start with whsec_
   ```

2. **Check Webhook Configuration**
   ```typescript
   // Ensure raw body is used
   app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
   
   // Verify webhook in handler
   const sig = req.headers['stripe-signature'];
   const event = stripe.webhooks.constructEvent(
     req.body,
     sig,
     process.env.STRIPE_WEBHOOK_SECRET
   );
   ```

3. **Test Webhook Locally**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3001/webhooks/stripe
   
   # Trigger test webhook
   stripe trigger payment_intent.succeeded
   ```

#### Problem: Subscription limits not enforced
**Symptoms:** Users exceed limits without restriction

**Solutions:**
1. **Check Usage Tracking**
   ```typescript
   // Verify limits are checked before actions
   export async function checkAndIncrementUsage(
     userId: string,
     type: 'claim' | 'save' | 'view'
   ) {
     const user = await prisma.user.findUnique({
       where: { id: userId }
     });
     
     const limit = user[`${type}Limit`];
     const used = user[`${type}sUsed`];
     
     if (limit !== -1 && used >= limit) {
       throw new Error(`${type} limit exceeded`);
     }
     
     await prisma.user.update({
       where: { id: userId },
       data: { [`${type}sUsed`]: { increment: 1 } }
     });
   }
   ```

2. **Implement Middleware**
   ```typescript
   export const checkUsageLimits = async (
     req: Request,
     res: Response,
     next: NextFunction
   ) => {
     const userId = req.user?.id;
     if (!userId) return next();
     
     try {
       await checkAndIncrementUsage(userId, 'view');
       next();
     } catch (error) {
       res.status(429).json({ error: error.message });
     }
   };
   ```

## Production Issues

### Performance Issues

#### Problem: Slow API response times
**Symptoms:** API responses taking >5 seconds, timeouts

**Diagnosis:**
1. **Monitor Query Performance**
   ```sql
   -- Enable slow query logging
   SET log_min_duration_statement = 1000; -- Log queries >1s
   
   -- Check slow queries
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Check Database Connections**
   ```sql
   -- Monitor active connections
   SELECT state, count(*)
   FROM pg_stat_activity
   GROUP BY state;
   ```

**Solutions:**
1. **Add Database Indexes**
   ```sql
   -- Create missing indexes
   CREATE INDEX CONCURRENTLY idx_daily_idea_confidence_created
   ON "DailyIdea"("confidenceScore" DESC, "createdAt" DESC);
   
   -- Analyze tables after indexing
   ANALYZE "DailyIdea";
   ```

2. **Implement Query Optimization**
   ```typescript
   // Use select to limit data transfer
   const ideas = await prisma.dailyIdea.findMany({
     select: {
       id: true,
       title: true,
       description: true,
       confidenceScore: true,
       // Don't select large JSON fields unless needed
     },
     where: { confidenceScore: { gte: 7 } },
     orderBy: { createdAt: 'desc' },
     take: 20,
   });
   ```

3. **Add Caching**
   ```typescript
   // Cache expensive queries
   const cacheKey = `ideas:trending:${JSON.stringify(filters)}`;
   let ideas = await cache.get(cacheKey);
   
   if (!ideas) {
     ideas = await getTrendingIdeas(filters);
     await cache.set(cacheKey, ideas, 300); // 5 minutes
   }
   
   return ideas;
   ```

#### Problem: High memory usage
**Symptoms:** Application crashes with "Out of memory" errors

**Solutions:**
1. **Monitor Memory Usage**
   ```typescript
   // Add memory monitoring
   setInterval(() => {
     const memUsage = process.memoryUsage();
     console.log('Memory Usage:', {
       rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
       heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
       external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
     });
     
     // Alert if memory usage is high
     if (memUsage.heapUsed > 400 * 1024 * 1024) { // 400MB
       console.warn('High memory usage detected');
     }
   }, 60000); // Every minute
   ```

2. **Optimize Large Data Processing**
   ```typescript
   // Use streaming for large datasets
   export async function processLargeDataset() {
     const stream = prisma.dailyIdea.findManyStream({
       select: { id: true, title: true }
     });
     
     for await (const idea of stream) {
       await processIdea(idea);
     }
   }
   
   // Implement pagination for large queries
   export async function getAllIdeasPaginated(pageSize = 100) {
     let cursor: string | undefined;
     
     while (true) {
       const ideas = await prisma.dailyIdea.findMany({
         take: pageSize,
         skip: cursor ? 1 : 0,
         cursor: cursor ? { id: cursor } : undefined,
         orderBy: { id: 'asc' },
       });
       
       if (ideas.length === 0) break;
       
       for (const idea of ideas) {
         await processIdea(idea);
       }
       
       cursor = ideas[ideas.length - 1].id;
     }
   }
   ```

### Deployment Issues

#### Problem: Build failures during deployment
```
Error: Module not found: Can't resolve '@/components/...'
```

**Solutions:**
1. **Check TypeScript Configuration**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"],
         "@/components/*": ["./src/components/*"],
         "@/lib/*": ["./src/lib/*"]
       }
     }
   }
   ```

2. **Verify Build Scripts**
   ```json
   // package.json
   {
     "scripts": {
       "build": "next build",
       "build:server": "cd apps/server && bun run build",
       "build:web": "cd apps/web && bun run build"
     }
   }
   ```

3. **Check Dependencies**
   ```bash
   # Ensure all dependencies are installed
   bun install --frozen-lockfile
   
   # Clear build cache
   rm -rf .next
   rm -rf apps/web/.next
   bun run build
   ```

#### Problem: Environment variables not loading
**Symptoms:** "undefined" values for environment variables in production

**Solutions:**
1. **Verify Environment Variables**
   ```bash
   # In Railway/Heroku dashboard, check all variables are set
   railway variables
   heroku config
   ```

2. **Check Variable Loading**
   ```typescript
   // Add debugging to verify variables load
   console.log('Environment check:', {
     NODE_ENV: process.env.NODE_ENV,
     DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
     OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Missing',
   });
   ```

3. **Fix Next.js Environment Variables**
   ```javascript
   // next.config.js
   module.exports = {
     env: {
       CUSTOM_KEY: process.env.CUSTOM_KEY,
     },
     // Or use publicRuntimeConfig for server-side access
     publicRuntimeConfig: {
       API_URL: process.env.NEXT_PUBLIC_API_URL,
     },
   };
   ```

### Monitoring and Debugging

#### Problem: Cannot trace errors in production
**Solutions:**
1. **Implement Proper Logging**
   ```typescript
   // Use structured logging
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     defaultMeta: { service: 'nuggetfinder-api' },
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       }),
     ],
   });
   
   // Use throughout application
   logger.info('User created', { userId, email });
   logger.error('Agent execution failed', { error, agentName, input });
   ```

2. **Add Error Boundaries**
   ```typescript
   // React Error Boundary
   export class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }
   
     static getDerivedStateFromError(error) {
       return { hasError: true };
     }
   
     componentDidCatch(error, errorInfo) {
       // Log error to monitoring service
       console.error('Error caught by boundary:', error, errorInfo);
     }
   
     render() {
       if (this.state.hasError) {
         return <h1>Something went wrong.</h1>;
       }
   
       return this.props.children;
     }
   }
   ```

3. **Use APM Tools**
   ```bash
   # Install Sentry for error tracking
   npm install @sentry/node @sentry/nextjs
   
   # Configure Sentry
   # sentry.client.config.js
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 0.1,
   });
   ```

## Emergency Procedures

### Database Recovery

#### If Database is Corrupted
1. **Stop Application**
   ```bash
   railway scale --app-id=your-app-id --replicas=0
   ```

2. **Restore from Backup**
   ```bash
   # Download latest backup
   railway backup download latest-backup.sql
   
   # Create new database
   createdb nuggetfinder_recovery
   
   # Restore data
   psql nuggetfinder_recovery < latest-backup.sql
   
   # Update connection string
   railway variables set DATABASE_URL="new-connection-string"
   ```

3. **Verify Data Integrity**
   ```sql
   -- Check record counts
   SELECT 'users' as table_name, COUNT(*) FROM "User"
   UNION ALL
   SELECT 'ideas', COUNT(*) FROM "DailyIdea"
   UNION ALL
   SELECT 'subscriptions', COUNT(*) FROM "Subscription";
   
   -- Check for consistency
   SELECT u.id, u.email, COUNT(s.id) as subscription_count
   FROM "User" u
   LEFT JOIN "Subscription" s ON u.id = s."referenceId"
   GROUP BY u.id, u.email
   HAVING COUNT(s.id) > 1; -- Should return no rows
   ```

#### If API is Down
1. **Quick Health Check**
   ```bash
   curl -f https://api.yourdomain.com/health
   ```

2. **Check Logs**
   ```bash
   railway logs --app-id=your-app-id --tail
   heroku logs --tail --app your-app-name
   ```

3. **Restart Application**
   ```bash
   railway redeploy --app-id=your-app-id
   heroku restart --app your-app-name
   ```

### Rollback Procedures

#### Rollback Application
```bash
# Railway
railway rollback --app-id=your-app-id --deployment-id=previous-deployment

# Heroku
heroku releases:rollback --app your-app-name

# Vercel
vercel rollback https://your-deployment-url.vercel.app
```

#### Rollback Database Migration
```bash
# Check migration status
bun db:status

# Rollback to previous migration
bun db:migrate --to 20240101000000_previous_migration

# Or reset to specific point
bun db:reset --to 20240101000000_previous_migration
```

## Support Contacts

### Internal Support
- **Development Team**: dev-team@yourdomain.com
- **DevOps**: devops@yourdomain.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX

### External Support
- **Railway Support**: help@railway.app
- **Vercel Support**: support@vercel.com
- **Stripe Support**: support@stripe.com
- **OpenAI Support**: support@openai.com

### Documentation Resources
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)

This troubleshooting guide covers the most common issues. For problems not covered here, check the application logs and reach out to the development team with specific error messages and reproduction steps.