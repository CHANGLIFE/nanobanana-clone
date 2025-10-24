# Creem Payment Integration Setup Guide

## Overview
This guide explains how to integrate Creem payment system with Nano Banana AI Image Editor.

## Prerequisites
- Node.js 18+ environment
- Creem account with API access
- Supabase database (already configured)

## Environment Configuration

### Development/Test Environment
```env
# Creem Payment Configuration (Test Mode)
CREEM_API_KEY=test_sk_your_test_api_key_here
CREEM_API_BASE=https://api.creem.io
CREEM_WEBHOOK_SECRET=whsec_test_your_webhook_secret_here
NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY=test_pk_your_publishable_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Environment
```env
# Creem Payment Configuration (Production)
CREEM_API_KEY=sk_live_your_production_api_key_here
CREEM_API_BASE=https://api.creem.io
CREEM_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here
NEXT_PUBLIC_CREEM_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## API Endpoints

### Payment Session Creation
- **Endpoint**: `POST /api/creem/create-payment`
- **Purpose**: Creates a new payment session for subscription
- **Request Body**:
  ```json
  {
    "planId": "pro",
    "planName": "Pro Plan",
    "price": 9.99,
    "userId": "user_id_here",
    "customerEmail": "user@example.com"
  }
  ```

### Payment Verification
- **Endpoint**: `GET /api/payment/verify?session_id={session_id}`
- **Purpose**: Verifies payment status after completion
- **Response**:
  ```json
  {
    "success": true,
    "sessionId": "cs_test_123",
    "planName": "Pro Plan",
    "planId": "pro",
    "credits": 500,
    "status": "active",
    "isTest": true
  }
  ```

### Webhook Handler
- **Endpoint**: `POST /api/creem/webhook`
- **Purpose**: Receives real-time payment events from Creem
- **Events Handled**:
  - `checkout.session.completed` - Payment successfully completed
  - `payment.succeeded` - Payment processed successfully
  - `invoice.paid` - Subscription payment completed
  - `customer.subscription.created` - New subscription created
  - `customer.subscription.updated` - Subscription updated
  - `customer.subscription.deleted` - Subscription cancelled
  - `payment.failed` - Payment failed

## Webhook Setup

### 1. Configure Webhook URL
In your Creem dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/creem/webhook`
3. Select events to receive:
   - Checkout sessions
   - Payments
   - Subscriptions
   - Invoices
4. Set webhook secret to match `CREEM_WEBHOOK_SECRET`

### 2. Test Webhook
```bash
# Test webhook endpoint
curl -X POST https://yourdomain.com/api/creem/webhook \
  -H "Content-Type: application/json" \
  -H "creem-signature: test_signature" \
  -d '{
    "type": "checkout.session.completed",
    "data": {"object": {"id": "test_session"}}
  }'
```

## Payment Plans

### Free Plan
- **Price**: $0.00
- **Credits**: 10 AI credits/month
- **Billing**: No automatic billing
- **User Action**: Activate immediately

### Pro Plan
- **Price**: $9.99/month
- **Credits**: 500 AI credits/month
- **Billing**: Recurring subscription
- **Features**: HD quality, commercial rights, custom presets

### Enterprise Plan
- **Price**: $29.99/month
- **Credits**: 2000 AI credits/month
- **Billing**: Recurring subscription
- **Features**: 4K output, API access, team collaboration

## Testing

### Development Mode
The system automatically detects test mode and:
- Creates test payment sessions without calling Creem API
- Simulates successful payment verification
- Uses test session IDs (format: `cs_test_*`)

### Manual Testing
1. Visit `/pricing` page
2. Click on any subscription plan button
3. Complete the payment flow
4. Verify success page loads correctly
5. Check browser console for debugging info

### Test Credit Cards (Creem Test Mode)
- Card Number: 4242 4242 4242 4242
- Expiration: Any future date
- CVC: Any 3 digits
- Result: Always successful in test mode

## Security Considerations

### Webhook Security
- All webhook requests are verified using HMAC-SHA256 signatures
- Invalid signatures are rejected with 401 status
- Request timestamps are logged for audit

### API Security
- All payment sessions use proper authentication
- User data is validated before processing
- Error responses don't expose sensitive information

### Environment Variable Security
- Never commit real API keys to version control
- Use different keys for development and production
- Set proper CORS headers for webhook endpoints

## Database Schema

### User Subscriptions Table
```sql
user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  creem_customer_id VARCHAR(255),
  creem_subscription_id VARCHAR(255),
  creem_session_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### User Credits Table
```sql
user_credits (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  credits INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Deployment

### Environment Variables Required
- `CREEM_API_KEY` - Secret API key
- `CREEM_WEBHOOK_SECRET` - Webhook signature secret
- `CREEM_API_BASE` - API base URL
- `NEXT_PUBLIC_SITE_URL` - Your application URL

### Required Services
- Ensure webhook endpoint is publicly accessible
- Configure HTTPS in production
- Set up proper DNS for webhook URL
- Enable payment retry logic for network failures

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
1. Check webhook URL is correct and accessible
2. Verify webhook secret matches in Creem dashboard
3. Check server logs for signature verification errors
4. Ensure firewall allows traffic from Creem servers

#### Payment Creation Failures
1. Verify API key is correct and active
2. Check network connectivity to api.creem.io
3. Review request payload format and required fields
4. Check rate limiting and API quotas

#### Test Mode Issues
1. Ensure `NODE_ENV=development` is set
2. Check that test API keys are properly configured
3. Verify test session IDs are generated correctly

### Debug Logging
Enable debug logging by setting:
```env
DEBUG=nanobanana:*
```

### Support Contacts
- **Creem Support**: support@creem.io
- **Technical Issues**: tech@nanobanana.ai
- **Documentation**: https://docs.creem.io

## API Rate Limits
- Payment creation: 100 requests per minute
- Webhook processing: 1000 events per hour
- Session retrieval: 1000 requests per hour

## Monitoring
Monitor these metrics:
- Payment success rate
- Webhook processing time
- API response times
- Error rates and types
- User subscription conversion rates

## Changelog
- v1.0.0 - Initial implementation with full Creem integration
- v1.0.1 - Added test mode and webhook security
- v1.0.2 - Enhanced error handling and logging