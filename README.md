# Website-Checker

An AWS Lambda function that monitors website availability by checking for 200 HTTP status responses and sends email alerts via AWS SES when sites are down.

## Features

- Monitors multiple websites concurrently
- Checks for HTTP 200 status responses
- Sends email alerts via AWS SES when sites fail
- Scheduled execution via CloudWatch Events
- Structured logging for CloudWatch
- Optimized for AWS Lambda with warm start reuse

## Prerequisites

- Node.js 23.x or higher
- AWS Account with:
  - Lambda permissions
  - SES permissions (and verified email addresses)
  - CloudWatch permissions
- Serverless Framework

## Installation

```bash
npm install
```

## Configuration

### 1. Configure Websites

Edit `websites.json` to add the websites you want to monitor:

```json
{
  "websites": [
    {
      "name": "My Website",
      "url": "https://example.com"
    },
    {
      "name": "Another Site",
      "url": "https://another-example.com"
    }
  ]
}
```

### 2. Configure Email Alerts

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Then edit `.env` with your email addresses:

```bash
ALERT_EMAIL_FROM=noreply@yourdomain.com
ALERT_EMAIL_TO=admin@yourdomain.com
```

The Serverless Framework will automatically load these environment variables during deployment.

**Important:** Both email addresses must be verified in AWS SES (or your account must be out of sandbox mode).

### 3. Configure Schedule

Modify the schedule in `serverless.yml`:

```yaml
events:
  - schedule:
      rate: rate(5 minutes)  # Change as needed
```

## Testing

Run unit tests:

```bash
npm test
```

## Deployment

Deploy to AWS:

```bash
npm run deploy
```

Or with specific options:

```bash
serverless deploy --stage prod --region us-west-2
```

## Project Structure

```
website-checker/
├── src/
│   ├── handlers/
│   │   └── websiteChecker.js    # Main Lambda handler
│   └── utils/
│       ├── httpChecker.js       # HTTP checking utilities
│       └── sesUtils.js          # SES email utilities
├── tests/
│   ├── httpChecker.test.js
│   ├── sesUtils.test.js
│   └── websiteChecker.test.js
├── .env                         # Email configuration (create from .env.example)
├── .env.example                 # Email configuration template
├── websites.json                # Website configuration
├── package.json
├── serverless.yml               # Infrastructure configuration
└── README.md
```

## How It Works

1. Lambda function is triggered on a schedule (default: every 5 minutes)
2. Reads website list from `websites.json`
3. Checks each website concurrently for HTTP 200 status
4. Logs results to CloudWatch
5. If any site fails, sends an email alert via SES with details

## Monitoring

View logs in AWS CloudWatch:

```bash
serverless logs -f websiteChecker --tail
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ALERT_EMAIL_FROM` | Sender email address (must be verified in SES) | Yes |
| `ALERT_EMAIL_TO` | Recipient email address | Yes |
| `AWS_REGION` | AWS region for SES (defaults to us-east-1) | No |

## AWS Permissions

The Lambda function requires these IAM permissions:

- `ses:SendEmail` - Send email alerts
- `ses:SendRawEmail` - Send raw email messages
- `logs:CreateLogGroup` - Create CloudWatch log groups
- `logs:CreateLogStream` - Create CloudWatch log streams
- `logs:PutLogEvents` - Write to CloudWatch logs

These are automatically configured in `serverless.yml`.

## Local Testing

Test the handler locally:

```bash
node --experimental-modules -e "import('./src/handlers/websiteChecker.js').then(m => m.handler({}, {requestId: 'local-test'}))"
```

## Troubleshooting

### Emails Not Sending

1. Verify email addresses in AWS SES console
2. Check CloudWatch logs for SES errors
3. Ensure Lambda has SES permissions
4. If in SES sandbox, both sender and recipient must be verified

### Lambda Timeout

- Increase timeout in `serverless.yml` if checking many websites
- Default timeout is 30 seconds

### High Costs

- Adjust schedule frequency in `serverless.yml`
- Reduce memory allocation if not needed

## License

MIT
