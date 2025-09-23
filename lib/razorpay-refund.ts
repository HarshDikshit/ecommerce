// lib/razorpay-refund.ts
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface RefundOptions {
  paymentId: string;
  amount?: number; // Amount in rupees (optional for full refund)
  speed?: 'normal' | 'optimum'; // Refund speed
  notes?: Record<string, string>;
  receipt?: string;
}

export interface RefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  acquirer_data: {
    arn: string | null;
  };
  created_at: number;
  batch_id: string | null;
  status: 'queued' | 'pending' | 'processed' | 'failed';
  speed_processed: 'normal' | 'optimum';
  speed_requested: 'normal' | 'optimum';
}

class RazorpayRefundService {
  // Create a refund
  async createRefund(options: RefundOptions): Promise<RefundResponse> {
    try {
      const refundData: any = {
        speed: options.speed || 'normal',
        notes: options.notes || {},
        receipt: options.receipt || `refund_${Date.now()}`,
      };

      // Add amount only if partial refund
      if (options.amount) {
        refundData.amount = options.amount * 100; // Convert to paise
      }

      const refund = await razorpay.payments.refund(options.paymentId, refundData);
      return refund as RefundResponse;
    } catch (error) {
      console.error('Razorpay refund error:', error);
      throw error;
    }
  }

  // Get refund details
  async getRefund(paymentId: string, refundId: string): Promise<RefundResponse> {
    try {
      const refund = await razorpay.payments.fetchRefund(paymentId, refundId);
      return refund as RefundResponse;
    } catch (error) {
      console.error('Fetch refund error:', error);
      throw error;
    }
  }

  // Get all refunds for a payment
  async getAllRefunds(paymentId: string): Promise<{ refunds: RefundResponse[] }> {
    try {
      const refunds = await razorpay.payments.fetchMultipleRefund(paymentId);
      return { refunds: refunds.items as RefundResponse[] };
    } catch (error) {
      console.error('Fetch multiple refunds error:', error);
      throw error;
    }
  }

  // Check refund status
  async checkRefundStatus(paymentId: string, refundId: string): Promise<string> {
    try {
      const refund = await this.getRefund(paymentId, refundId);
      return refund.status;
    } catch (error) {
      console.error('Check refund status error:', error);
      throw error;
    }
  }
}

export const razorpayRefundService = new RazorpayRefundService();