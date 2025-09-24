import axios from 'axios'
import crypto from 'crypto'
import CryptoJS from 'crypto-js'

// Wise API configuration
export const WISE_CONFIG = {
  baseURL: process.env.WISE_BASE_URL || 'https://api.sandbox.transferwise.tech', // Use sandbox for development
  currency: 'USD',
  accountId: process.env.WISE_ACCOUNT_ID,
  profileId: process.env.WISE_PROFILE_ID,
}

// Payment status types for Wise
export type WisePaymentStatus = 'processing' | 'sent_to_recipient' | 'funds_converted' | 'bounced_back' | 'charged_back' | 'cancelled' | 'unknown'

// Wise payment metadata interface
export interface WisePaymentMetadata {
  bookingId?: string
  userId?: string
  classId?: string
  eventId?: string
  bookingType: 'class' | 'event'
  amount: string
  currency: string
}

// Wise transfer interface
export interface WiseTransferRequest {
  targetAccount: string
  quoteUuid: string
  customerTransactionId: string
  details: {
    reference: string
    transferPurpose: string
    sourceOfFunds: string
  }
}

// Wise quote interface
export interface WiseQuoteRequest {
  sourceCurrency: string
  targetCurrency: string
  sourceAmount?: number
  targetAmount?: number
  payOut: string
}

// Wise recipient interface
export interface WiseRecipientAccount {
  currency: string
  type: string
  profile: string
  accountHolderName: string
  details: Record<string, any>
}

class WiseService {
  private apiKey: string
  private baseURL: string
  private accountId: string
  private profileId: string

  constructor() {
    this.apiKey = process.env.WISE_API_KEY || ''
    this.baseURL = WISE_CONFIG.baseURL
    this.accountId = WISE_CONFIG.accountId || ''
    this.profileId = WISE_CONFIG.profileId || ''
  }

  // Create HTTP client with authentication
  private createClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-idempotency-key': this.generateIdempotencyKey(),
      },
    })
  }

  // Generate idempotency key for safe retries
  private generateIdempotencyKey(): string {
    return crypto.randomUUID()
  }

  // Validate Wise configuration
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!this.apiKey) {
      errors.push('WISE_API_KEY is not set')
    }
    
    if (!this.accountId) {
      errors.push('WISE_ACCOUNT_ID is not set')
    }
    
    if (!this.profileId) {
      errors.push('WISE_PROFILE_ID is not set')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get exchange rate quote
  async createQuote(request: WiseQuoteRequest): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.post('/v2/quotes', {
        ...request,
        profile: this.profileId,
      })
      return response.data
    } catch (error) {
      console.error('Error creating Wise quote:', error)
      throw error
    }
  }

  // Create a recipient account
  async createRecipientAccount(account: WiseRecipientAccount): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.post('/v1/accounts', account)
      return response.data
    } catch (error) {
      console.error('Error creating Wise recipient account:', error)
      throw error
    }
  }

  // Create a transfer
  async createTransfer(transfer: WiseTransferRequest): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.post('/v1/transfers', transfer)
      return response.data
    } catch (error) {
      console.error('Error creating Wise transfer:', error)
      throw error
    }
  }

  // Fund a transfer
  async fundTransfer(transferId: string, type: string = 'BALANCE'): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.post(`/v3/profiles/${this.profileId}/transfers/${transferId}/payments`, {
        type: type
      })
      return response.data
    } catch (error) {
      console.error('Error funding Wise transfer:', error)
      throw error
    }
  }

  // Get transfer details
  async getTransfer(transferId: string): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.get(`/v1/transfers/${transferId}`)
      return response.data
    } catch (error) {
      console.error('Error getting Wise transfer:', error)
      throw error
    }
  }

  // Cancel a transfer
  async cancelTransfer(transferId: string): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.put(`/v1/transfers/${transferId}/cancel`)
      return response.data
    } catch (error) {
      console.error('Error cancelling Wise transfer:', error)
      throw error
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const webhookSecret = process.env.WISE_WEBHOOK_SECRET || ''
      const expectedSignature = CryptoJS.HmacSHA256(payload, webhookSecret).toString(CryptoJS.enc.Hex)
      return signature === expectedSignature
    } catch (error) {
      console.error('Error verifying Wise webhook signature:', error)
      return false
    }
  }

  // Create a payment for dance class/event booking
  async createBookingPayment(metadata: WisePaymentMetadata, recipientDetails: any): Promise<any> {
    try {
      const configValidation = this.validateConfig()
      if (!configValidation.isValid) {
        throw new Error(`Wise configuration invalid: ${configValidation.errors.join(', ')}`)
      }

      // Step 1: Create a quote
      const quote = await this.createQuote({
        sourceCurrency: metadata.currency,
        targetCurrency: recipientDetails.currency || 'USD',
        sourceAmount: parseFloat(metadata.amount),
        payOut: 'BALANCE', // Can be 'BALANCE' or 'BANK_TRANSFER'
      })

      // Step 2: Create recipient account if needed
      let recipientAccount
      if (!recipientDetails.accountId) {
        recipientAccount = await this.createRecipientAccount({
          currency: recipientDetails.currency || 'USD',
          type: recipientDetails.type || 'EMAIL',
          profile: this.profileId,
          accountHolderName: recipientDetails.name,
          details: recipientDetails.details || {
            email: recipientDetails.email
          }
        })
      }

      // Step 3: Create the transfer
      const transfer = await this.createTransfer({
        targetAccount: recipientDetails.accountId || recipientAccount.id,
        quoteUuid: quote.id,
        customerTransactionId: `booking-${metadata.bookingId}-${Date.now()}`,
        details: {
          reference: `${metadata.bookingType.toUpperCase()} booking - ${metadata.bookingId}`,
          transferPurpose: 'verification.transfers.purpose.pay.for.goods.services',
          sourceOfFunds: 'verification.source.of.funds.other',
        }
      })

      return {
        success: true,
        transferId: transfer.id,
        quoteId: quote.id,
        status: transfer.status,
        amount: metadata.amount,
        currency: metadata.currency,
        recipientAccountId: recipientDetails.accountId || recipientAccount?.id,
        estimatedDelivery: quote.deliveryEstimate,
        fees: quote.fee,
        rate: quote.rate,
      }

    } catch (error) {
      console.error('Error creating Wise booking payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Process payment for booking (fund the transfer)
  async processBookingPayment(transferId: string): Promise<any> {
    try {
      const fundingResult = await this.fundTransfer(transferId, 'BALANCE')
      
      return {
        success: true,
        transferId,
        paymentStatus: 'processing',
        fundingResult,
      }
    } catch (error) {
      console.error('Error processing Wise booking payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Get payment status
  async getPaymentStatus(transferId: string): Promise<WisePaymentStatus> {
    try {
      const transfer = await this.getTransfer(transferId)
      
      // Map Wise transfer status to our payment status
      switch (transfer.status) {
        case 'incoming_payment_waiting':
        case 'processing':
          return 'processing'
        case 'funds_converted':
          return 'funds_converted'
        case 'outgoing_payment_sent':
          return 'sent_to_recipient'
        case 'bounced_back':
          return 'bounced_back'
        case 'charged_back':
          return 'charged_back'
        case 'cancelled':
          return 'cancelled'
        default:
          return 'unknown'
      }
    } catch (error) {
      console.error('Error getting Wise payment status:', error)
      return 'unknown'
    }
  }

  // Helper function to format amount for Wise (in major currency units)
  formatAmount(amount: number): number {
    return Math.round(amount * 100) / 100 // Ensure 2 decimal places
  }

  // Helper function to get supported currencies
  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const client = this.createClient()
      const response = await client.get('/v1/currencies')
      return response.data.map((currency: any) => currency.code)
    } catch (error) {
      console.error('Error getting supported currencies:', error)
      return ['USD', 'EUR', 'GBP'] // Default fallback
    }
  }

  // Get account balance
  async getBalance(): Promise<any> {
    try {
      const client = this.createClient()
      const response = await client.get(`/v4/profiles/${this.profileId}/balances`)
      return response.data
    } catch (error) {
      console.error('Error getting Wise balance:', error)
      throw error
    }
  }
}

// Export singleton instance
export const wiseService = new WiseService()
export default WiseService

// Helper function to create a Wise payment for booking
export async function createWiseBookingPayment(options: {
  amount: number
  currency: string
  bookingId: string
  userId: string
  classId?: string
  eventId?: string
  bookingType: 'class' | 'event'
  recipientDetails: any
}): Promise<any> {
  const metadata: WisePaymentMetadata = {
    bookingId: options.bookingId,
    userId: options.userId,
    classId: options.classId,
    eventId: options.eventId,
    bookingType: options.bookingType,
    amount: options.amount.toString(),
    currency: options.currency
  }

  return await wiseService.createBookingPayment(metadata, options.recipientDetails)
}

// Helper function to check if Wise is properly configured
export const validateWiseConfig = (): { isValid: boolean; errors: string[] } => {
  return wiseService.validateConfig()
}