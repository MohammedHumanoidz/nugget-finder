# Trigger.dev Setup Guide

This guide explains how to set up and deploy the daily idea generation background job using Trigger.dev.

## Prerequisites

1. A Trigger.dev account (sign up at [trigger.dev](https://trigger.dev))
2. Node.js/Bun environment
3. Access to the server environment variables

## Setup Steps

### 1. Create Trigger.dev Project

1. Go to [trigger.dev](https://trigger.dev) and create an account
2. Create a new project for your application
3. Copy your API key from the project dashboard

### 2. Configure Environment Variables

Update your `.env` file with the Trigger.dev credentials:

```bash
# Trigger.dev Configuration
TRIGGER_SECRET_KEY="your-actual-trigger-secret-key"
TRIGGER_API_URL="https://api.trigger.dev"
```

### 3. Job Implementation

The daily idea generation job is already implemented in:
- `src/jobs/daily-idea-generation.ts` - Main job definition
- `src/lib/trigger.ts` - Trigger.dev client configuration

The job is configured to:
- Run daily at midnight (00:00) using CRON expression `0 0 * * *`
- Generate 4 ideas by calling the existing `generateDailyIdea()` function
- Include comprehensive error handling and logging
- Add delays between requests to prevent system overload

### 4. Job Features

**Scheduling**: Runs automatically every day at midnight
**Retry Logic**: Each idea generation attempt is independent
**Logging**: Comprehensive logging using both Trigger.dev's logger and the application's debug logger
**Error Handling**: Graceful handling of failures with detailed error reporting
**Monitoring**: Full visibility in the Trigger.dev dashboard

### 5. Deployment

1. **Install Dependencies**: Already completed with `@trigger.dev/sdk`

2. **Deploy to Trigger.dev**:
   ```bash
   cd apps/server
   npx @trigger.dev/cli@latest deploy
   ```

3. **Verify Deployment**:
   - Check the Trigger.dev dashboard for your deployed job
   - Verify the job is scheduled correctly
   - Monitor the first few runs

### 6. Testing

You can test the job manually from the Trigger.dev dashboard:

1. Go to your project dashboard
2. Find the "daily.idea.generator" job
3. Click "Test" to run it manually
4. Monitor the logs and results

### 7. Monitoring

The job provides detailed monitoring:

- **Trigger.dev Dashboard**: Real-time job execution logs and status
- **Application Logs**: Detailed logging via the application's logger system
- **Database**: Generated ideas are automatically saved to the database

### 8. Job Configuration

The job is configured with:

```typescript
{
  id: "daily.idea.generator",
  name: "Daily Idea Generation",
  version: "1.0.0",
  trigger: {
    type: "scheduled",
    cron: "0 0 * * *", // Daily at midnight
  }
}
```

### 9. Security

The job is secured through:
- Environment variable-based API key authentication
- No direct external API exposure
- Internal function calls to existing validated endpoints

### 10. Troubleshooting

**Common Issues**:

1. **Invalid API Key**: Ensure `TRIGGER_SECRET_KEY` is correctly set
2. **Job Not Running**: Check the CRON expression and timezone settings
3. **Generation Failures**: Monitor application logs for detailed error information
4. **Rate Limiting**: The job includes 10-second delays between requests

**Logs Location**:
- Trigger.dev dashboard for job execution logs
- Application logs for detailed generation process logs

## Summary

The daily idea generation job is now configured to:
1. ✅ Run automatically every day at midnight
2. ✅ Generate exactly 4 ideas per day
3. ✅ Handle errors gracefully with detailed logging
4. ✅ Provide full monitoring and visibility
5. ✅ Use the existing validated idea generation pipeline

The system ensures reliable daily idea generation with comprehensive error handling and monitoring capabilities.