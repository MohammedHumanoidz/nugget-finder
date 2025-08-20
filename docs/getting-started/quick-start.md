# Quick Start Guide

Get Nugget Finder running in 5 minutes with this streamlined setup guide.

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ Bun package manager installed
- ✅ PostgreSQL database available (or use SQLite for development)
- ✅ OpenAI API key
- ✅ Claude API key (optional but recommended)

## Installation Steps

### 1. Clone & Install
```bash
git clone <repository-url>
cd nugget-finder
bun install
```

### 2. Environment Setup
```bash
# Copy environment files
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Configure Essential Variables

**apps/server/.env**
```env
# For development, you can use SQLite
DATABASE_URL="file:./dev.db"

# Required: Add your AI API keys
OPENAI_API_KEY="sk-..."
CLAUDE_API_KEY="sk-..." # Optional but recommended

# Required: Generate a secure secret
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3001"

# Optional: For subscription features
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**apps/web/.env**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Database Setup
```bash
cd apps/server
bun db:generate
bun db:migrate
```

### 5. Start Development
```bash
# From root directory
bun dev
```

## Access Points

- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/trpc

## Test the Installation

1. Open http://localhost:3000
2. Sign up for an account
3. Try generating an idea with a prompt like "AI for healthcare"
4. Verify the multi-agent system generates ideas

## Common Quick Fixes

### Port Conflicts
```bash
# Change ports in package.json or use different ports
PORT=3010 bun dev
```

### Database Issues
```bash
# Reset and recreate database
bun db:reset
bun db:migrate
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules
bun install
```

## Next Steps

- Review the [full installation guide](installation.md)
- Explore the [development workflow](../development/development-workflow.md)
- Check out the [architecture overview](../architecture/system-overview.md)

## Need Help?

- Check the [troubleshooting guide](../deployment/troubleshooting.md)
- Review environment variable requirements in [configuration reference](../reference/configuration.md)