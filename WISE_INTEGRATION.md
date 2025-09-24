# Wise Payment Integration

This document explains how to set up and use the Wise payment integration alongside Stripe for international payments and better exchange rates.

## 🌟 Features

- **Multi-currency support**: Accept payments in multiple currencies with great exchange rates
- **Lower international fees**: Significantly lower fees for international payments compared to traditional providers
- **Bank-level security**: Wise is regulated by financial authorities and uses bank-level security
- **Real-time status updates**: Webhook integration for real-time payment status updates
- **Unified payment API**: Single API endpoint supporting both Stripe and Wise
- **Email notifications**: Automatic confirmation emails for successful payments
- **Admin dashboard**: View and manage both Stripe and Wise transactions

## 🚀 Setup

### 1. Environment Variables

Add the following variables to your `.env` file:

```bash
# Wise Configuration
WISE_API_KEY=your_wise_api_key_here
WISE_ACCOUNT_ID=your_wise_account_id_here
WISE_PROFILE_ID=your_wise_profile_id_here
WISE_BASE_URL=https://api.sandbox.transferwise.tech  # Use sandbox for development
WISE_WEBHOOK_SECRET=your_wise_webhook_secret_here
```

### 2. Getting Wise Credentials

1. **Create a Wise Business Account**: Visit [wise.com/business](https://wise.com/business/)
2. **API Access**: Contact Wise support to enable API access for your business account
3. **Get API Key**: Generate an API key from your Wise business dashboard
4. **Profile ID**: Find your profile ID in the account settings
5. **Account ID**: Get your account ID from the account details

### 3. Database Migration

The database schema has been updated to include `WISE` as a payment provider. Run the migration:

```bash
npx prisma db push
```

### 4. Webhook Setup

Configure your webhook endpoint in Wise:
- **Webhook URL**: `https://yourdomain.com/api/webhooks/wise`
- **Events**: Select all transfer events
- **Secret**: Set a secure webhook secret and add it to your environment variables

## 📱 Frontend Integration

### Using the Payment Provider Selector

```tsx
import PaymentProviderSelector from '@/app/components/payments/PaymentProviderSelector'

function CheckoutForm() {
  const [paymentProvider, setPaymentProvider] = useState<'STRIPE' | 'WISE'>('STRIPE')

  return (
    <PaymentProviderSelector
      selectedProvider={paymentProvider}
      onProviderChange={setPaymentProvider}
    />
  )
}
```

### Creating a Payment Session

```typescript
// Example API call to create payment session
const response = await fetch('/api/payments/create-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    paymentProvider: 'WISE', // or 'STRIPE'
    bookingType: 'class',
    itemId: 'class-id',
    userId: 'user-id',
    customAmount: 100.00,
    // Wise-specific fields
    wiseRecipientDetails: {
      name: 'Recipient Name',
      email: 'recipient@example.com',
      currency: 'USD',
      type: 'EMAIL'
    }
  })
})
```

## 🔧 API Usage

### Payment Creation API

**Endpoint**: `POST /api/payments/create-session`

**Request Body**:
```json
{
  "paymentProvider": "WISE",
  "bookingType": "class",
  "itemId": "class-123",
  "userId": "user-456",
  "customAmount": 100.00,
  "wiseRecipientDetails": {
    "name": "Dance Instructor",
    "email": "instructor@example.com",
    "currency": "USD",
    "type": "EMAIL"
  }
}
```

**Response** (Wise):
```json
{
  "success": true,
  "paymentProvider": "WISE",
  "transferId": "12345",
  "quoteId": "67890",
  "status": "processing",
  "estimatedDelivery": "2024-01-15T10:00:00Z",
  "fees": 2.50,
  "rate": 1.25,
  "booking": {
    "id": "booking-123",
    "confirmationCode": "CLASS-1234567890-ABC",
    "totalAmount": 100.00,
    "finalAmount": 100.00
  }
}
```

### Webhook Handler

**Endpoint**: `POST /api/webhooks/wise`

The webhook automatically:
- Validates the signature
- Updates transaction status
- Updates booking status
- Sends confirmation emails
- Triggers notifications

## 🔄 Payment Flow

### Wise Payment Flow

1. **User selects Wise**: User chooses Wise as payment method
2. **Create quote**: System creates a Wise quote for the payment
3. **Create recipient**: System creates or uses existing recipient account
4. **Create transfer**: System creates a Wise transfer
5. **Fund transfer**: User funds the transfer (via Wise platform)
6. **Status updates**: Webhooks provide real-time status updates
7. **Confirmation**: User receives confirmation email when payment succeeds

### Status Mapping

| Wise Status | Internal Status | Booking Status | Description |
|-------------|----------------|----------------|-------------|
| `incoming_payment_waiting` | `CREATED` | `PENDING` | Waiting for payment |
| `processing` | `CREATED` | `PENDING` | Payment being processed |
| `funds_converted` | `SUCCEEDED` | `CONFIRMED` | Funds converted successfully |
| `outgoing_payment_sent` | `SUCCEEDED` | `CONFIRMED` | Payment sent to recipient |
| `bounced_back` | `FAILED` | `CANCELLED` | Payment bounced back |
| `charged_back` | `FAILED` | `CANCELLED` | Payment charged back |
| `cancelled` | `CANCELLED` | `CANCELLED` | Transfer cancelled |

## 🛠️ Development

### Testing with Sandbox

1. Use the sandbox API URL: `https://api.sandbox.transferwise.tech`
2. Use sandbox credentials from your Wise business account
3. Test webhooks using tools like ngrok for local development:
   ```bash
   ngrok http 3000
   # Then use: https://your-id.ngrok.io/api/webhooks/wise
   ```

### Configuration Validation

The system includes built-in configuration validation:

```typescript
import { validateWiseConfig } from '@/app/lib/wise'

const validation = validateWiseConfig()
if (!validation.isValid) {
  console.error('Wise configuration errors:', validation.errors)
}
```

## 📊 Admin Features

### Payment Management

- View both Stripe and Wise transactions in the admin panel
- Track payment statuses and processing times
- Handle refunds and cancellations
- Export payment data for accounting

### Analytics

- Compare payment methods by volume and success rate
- Track international vs domestic payments
- Monitor exchange rate savings
- Fee analysis and optimization

## 🔒 Security

### Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS Only**: Use HTTPS for all webhook endpoints
4. **Rate Limiting**: Implement rate limiting on payment endpoints
5. **Audit Logging**: Log all payment-related activities

### Compliance

- Wise is regulated by financial authorities in multiple countries
- Compliant with PCI DSS for payment processing
- GDPR compliant for European customers
- SOC 2 Type II certified

## 🚨 Troubleshooting

### Common Issues

1. **Invalid API Key**: Check that your API key is correct and has proper permissions
2. **Profile Not Found**: Ensure your profile ID matches your business account
3. **Webhook Signature Mismatch**: Verify your webhook secret is correctly configured
4. **Currency Not Supported**: Check Wise's supported currencies for your region

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

### Support

- **Wise API Documentation**: [docs.wise.com](https://docs.wise.com/)
- **Wise Support**: Contact through your business account dashboard
- **Integration Support**: Check the logs in `/api/webhooks/wise` for webhook issues

## 📈 Benefits

### For International Customers

- **Better Exchange Rates**: Up to 8x cheaper than traditional banks
- **Transparent Fees**: Always know exactly what you'll pay
- **Fast Transfers**: Most transfers complete within 1-2 business days
- **Multi-currency**: Support for 70+ currencies

### For Business

- **Lower Costs**: Reduce payment processing fees significantly
- **Global Reach**: Accept payments from customers worldwide
- **Better UX**: Familiar payment flow for international customers
- **Compliance**: Regulated and secure payment processing

## 🔄 Migration

### From Stripe-only to Multi-provider

1. Update your payment forms to include provider selection
2. Test both payment flows thoroughly
3. Update your admin dashboard to handle both providers
4. Train your team on the new payment options
5. Communicate the new payment methods to your customers

### Gradual rollout

Consider a gradual rollout:
1. Start with admin/test accounts only
2. Roll out to beta users
3. Full rollout after validation

This integration provides a robust, secure, and cost-effective payment solution for international dance class bookings! 🌍💃