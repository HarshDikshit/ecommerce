// types/razorpay.d.ts
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, any>;
  };
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: 'payment.failed', handler: (response: RazorpayErrorResponse) => void): void;
}

declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  close(): void;
  on(event: 'payment.failed', handler: (response: RazorpayErrorResponse) => void): void;
}

declare global {
  interface Window {
    Razorpay: typeof Razorpay;
  }
}