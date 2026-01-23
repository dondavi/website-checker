# Website Checker (TypeScript)

A serverless AWS Lambda function that monitors website availability and sends email alerts via AWS SES when sites are down.

## Features

- Checks multiple websites concurrently for HTTP 200 status
- Sends email alerts via AWS SES when websites fail
- Runs on a configurable schedule (default: every 3 hours)
- Built with TypeScript for type safety
- Uses AWS SDK v3 for optimal Lambda performance

## Project Structure

```
typescript/
├── src/
│   ├── handlers/
│   │   └── websiteChecker.ts    # Lambda handler
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── utils/
│       ├── httpChecker.ts       # HTTP request utilities
│       └── sesUtils.ts          # AWS SES email utilities
├── tests/
│   ├── httpChecker.test.ts
│   ├── sesUtils.test.ts
│   └── websiteChecker.test.ts
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── jest.config.js
├── serverless.yml
└── websites.json                # Website configuration
```

## Prerequisites

- Node.js 22.x or later
- npm
- AWS CLI configured with appropriate credentials
- AWS SES configured with verified email addresses

## Installation

```bash
npm install
```

## Configuration

### Websites

Edit `websites.json` to add the websites you want to monitor:

```json
{
  "websites": [
    {
      "name": "My Website",
      "url": "https://example.com"
    },
    {
      "name": "API Server",
      "url": "https://api.example.com/health"
    }
  ]
}
```

### Environment Variables

Create a `.env` file in the project root:

```env
ALERT_EMAIL_FROM=alerts@yourdomain.com
ALERT_EMAIL_TO=admin@yourdomain.com
```

Both email addresses must be verified in AWS SES (or your SES account must be out of sandbox mode).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run deploy` | Build and deploy to AWS |
| `npm run clean` | Remove compiled files |
| `npm run lint` | Run ESLint |

## Development

### Build

```bash
npm run build
```

This compiles TypeScript files from `src/` to `dist/`.

### Test

```bash
npm test
```

Tests use Jest with ts-jest for TypeScript support. Integration tests that hit external endpoints are skipped by default.

### Local Testing

You can invoke the handler locally for testing:

```typescript
import { handler } from './dist/handlers/websiteChecker.js';

const mockEvent = { /* ScheduledEvent */ };
const mockContext = { awsRequestId: 'local-test' };

handler(mockEvent, mockContext).then(console.log);
```

## Deployment

### Deploy to AWS

```bash
npm run deploy
```

Or deploy to a specific stage/region:

```bash
npx serverless deploy --stage prod --region us-west-2
```

### IAM Permissions

The Lambda function requires the following permissions (configured in `serverless.yml`):

- `ses:SendEmail` - Send alert emails
- `ses:SendRawEmail` - Send raw emails
- `logs:CreateLogGroup` - Create CloudWatch log groups
- `logs:CreateLogStream` - Create log streams
- `logs:PutLogEvents` - Write logs

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CloudWatch    │────▶│     Lambda      │────▶│    Websites     │
│   Events        │     │  websiteChecker │     │   (HTTP GET)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │ On Failure
                                 ▼
                        ┌─────────────────┐
                        │     AWS SES     │
                        │  (Send Alert)   │
                        └─────────────────┘
```

## Type Definitions

Key interfaces defined in `src/types/index.ts`:

- `Website` - Website configuration (name, url)
- `WebsiteCheckResult` - Result of checking a website
- `AlertParams` - Email alert parameters
- `LambdaResponse` - Lambda function response

## Alert Email Format

When websites fail, an email is sent with the following format:

```
Subject: Website Alert: 2 site(s) down

Website Availability Alert
Timestamp: 2024-01-15T10:30:00.000Z

The following websites are not responding with a 200 status:

1. My Website
   URL: https://example.com
   Status Code: 503
   Error: Service Unavailable

2. API Server
   URL: https://api.example.com/health
   Status Code: N/A
   Error: Connection timeout

This is an automated alert from the Website-Checker Lambda function.
```

## Troubleshooting

### Emails not sending

1. Verify both sender and recipient emails are verified in SES
2. Check if your SES account is still in sandbox mode
3. Review CloudWatch logs for error messages

### Timeouts

The default request timeout is 12 seconds. For slow websites, you may need to adjust the `REQUEST_TIMEOUT` constant in `src/utils/httpChecker.ts`.

### Lambda timeout

The default Lambda timeout is 30 seconds. If checking many websites, increase the timeout in `serverless.yml`.

## License

MIT
