# Installation Guide

This guide provides detailed instructions for setting up Nugget Finder for development and production environments.

## System Requirements

### Minimum Requirements
- **Node.js**: Version 18.0 or higher
- **Package Manager**: Bun (recommended) or npm
- **Database**: PostgreSQL 12+ (production) or SQLite (development)
- **Memory**: 4GB RAM minimum
- **Storage**: 2GB free disk space

### Recommended Requirements
- **Node.js**: Version 20.0 or higher
- **Package Manager**: Bun latest version
- **Database**: PostgreSQL 14+
- **Memory**: 8GB RAM or higher
- **Storage**: 10GB free disk space for development

## Prerequisites Installation

### 1. Node.js Installation

**Using Node Version Manager (Recommended)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

**Direct Installation**
- Download from [nodejs.org](https://nodejs.org/)
- Choose version 18+ or higher

### 2. Bun Package Manager

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### 3. Database Setup

#### PostgreSQL (Production)
**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE nuggetfinder;
CREATE USER nuggetuser WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE nuggetfinder TO nuggetuser;
\q
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb nuggetfinder
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer and follow setup wizard

#### SQLite (Development)
SQLite is automatically installed with Node.js - no additional setup required.

### 4. API Keys Setup

#### OpenAI API Key
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create account or sign in
3. Generate new API key
4. Note the key for environment configuration

#### Claude API Key (Optional but Recommended)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Generate new API key
4. Note the key for environment configuration

#### Stripe API Keys (For Subscription Features)
1. Visit [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or sign in
3. Navigate to API keys section
4. Copy both publishable and secret keys (use test keys for development)

## Project Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd nugget-finder

# Verify project structure
ls -la
```

### 2. Install Dependencies

```bash
# Install all dependencies using Bun (recommended)
bun install

# Alternative: Using npm
npm install
```

### 3. Environment Configuration

#### Copy Environment Templates
```bash
# Server environment
cp apps/server/.env.example apps/server/.env

# Web environment  
cp apps/web/.env.example apps/web/.env
```

#### Configure Server Environment (apps/server/.env)

**Development Configuration:**
```env
# Database Configuration
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://nuggetuser:securepassword@localhost:5432/nuggetfinder"  # PostgreSQL

# AI API Keys
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"
CLAUDE_API_KEY="sk-ant-your-claude-api-key-here"

# Authentication
BETTER_AUTH_SECRET="generate-a-secure-32-character-secret"
BETTER_AUTH_URL="http://localhost:3001"

# Stripe (Test Keys for Development)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Background Jobs
TRIGGER_SECRET_KEY="tr_dev_your_trigger_secret"

# Optional: Additional Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"  
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Development Settings
NODE_ENV="development"
PORT="3001"
CORS_ORIGIN="http://localhost:3000"
```

**Production Configuration:**
```env
# Database Configuration - Use PostgreSQL in production
DATABASE_URL="postgresql://username:password@host:port/database_name"

# AI API Keys - Use production keys
OPENAI_API_KEY="sk-your-production-openai-key"
CLAUDE_API_KEY="sk-ant-your-production-claude-key"

# Authentication - Use secure secrets
BETTER_AUTH_SECRET="your-secure-production-secret-32-chars"
BETTER_AUTH_URL="https://yourdomain.com"

# Stripe - Use live keys
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"

# Background Jobs - Use production keys
TRIGGER_SECRET_KEY="tr_prod_your_trigger_secret"

# Production Settings
NODE_ENV="production"
PORT="3001"
CORS_ORIGIN="https://yourdomain.com"
```

#### Configure Web Environment (apps/web/.env)

**Development:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Production:**
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 4. Database Setup and Migration

```bash
# Navigate to server directory
cd apps/server

# Generate Prisma client
bun db:generate

# Run database migrations
bun db:migrate

# Optional: Seed database with sample data
bun db:seed

# Navigate back to root
cd ../..
```

### 5. Start Development Servers

#### Start All Services
```bash
# From project root - starts both web and server
bun dev
```

#### Start Services Individually
```bash
# Terminal 1: Start server
cd apps/server
bun dev

# Terminal 2: Start web app
cd apps/web
bun dev
```

### 6. Verify Installation

#### Access Points
- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/trpc

#### Test Functionality
1. Open http://localhost:3000 in browser
2. Sign up for a new account
3. Try generating an idea with prompt: "AI for small businesses"
4. Verify that the multi-agent system generates ideas successfully

## Development Tools Setup

### 1. Database Management

#### Prisma Studio
```bash
# Start Prisma Studio for database exploration
cd apps/server
bun db:studio
```

Access at: http://localhost:5555

#### Database Commands
```bash
# View current migration status
bun db:status

# Reset database (WARNING: Deletes all data)
bun db:reset

# Deploy migrations to production
bun db:deploy
```

### 2. Code Quality Tools

#### TypeScript Compilation
```bash
# Type check all packages
bun run typecheck

# Type check specific app
cd apps/web
bun run typecheck
```

#### Linting
```bash
# Lint all packages
bun run lint

# Fix linting issues
bun run lint:fix
```

#### Testing
```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

## Troubleshooting

### Common Installation Issues

#### Port Conflicts
```bash
# Kill processes using required ports
sudo lsof -i :3000
sudo lsof -i :3001
kill -9 <process-id>

# Or use different ports
PORT=3010 bun dev
```

#### Database Connection Issues
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U nuggetuser -d nuggetfinder

# Reset and recreate database
bun db:reset
```

#### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm bun.lockb  # or package-lock.json
bun install

# Clear Bun cache
bun pm cache clear
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
cd apps/server
bun run env-check

# Check specific variables
echo $DATABASE_URL
echo $OPENAI_API_KEY
```

### Performance Optimization

#### Development Performance
```bash
# Use SWC for faster builds
export SWC=true

# Enable turbo for faster rebuilds
bun dev --turbo

# Disable source maps for faster builds
export DISABLE_SOURCE_MAPS=true
```

## Next Steps

After successful installation:

1. **Explore the Application**: Try different idea generation prompts
2. **Review Architecture**: Read the [system overview](../architecture/system-overview.md)
3. **Development Workflow**: Check the [development guide](../development/development-workflow.md)
4. **Database Schema**: Understand the [database schema](../architecture/database-schema.md)
5. **API Documentation**: Explore the [API reference](../reference/api-reference.md)

## Getting Help

If you encounter issues during installation:

1. Check the [troubleshooting guide](../deployment/troubleshooting.md)
2. Review environment variable requirements
3. Verify all prerequisites are correctly installed
4. Check the project's GitHub issues for known problems

## Security Notes

- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate API keys and secrets
- Use strong passwords for database connections
- Enable two-factor authentication on all service accounts