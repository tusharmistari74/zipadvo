/**
 * Client-side Razorpay Checkout Loader and Handler
 * 
 * Never accesses or stores Razorpay Key Secret.
 * Uses public key id from the server create-order response.
 */

import type { Booking, PaymentTransaction } from '@legalhub/types';

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (resp: { error?: { description?: string; reason?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export interface RazorpayVerificationResult {
  success: boolean;
  booking?: Booking;
  transaction?: PaymentTransaction;
  message?: string;
  error?: string;
}

export interface InitiatePaymentOptions {
  bookingId: string;
  userId: string;
  userRole?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  onSuccess: (verificationResult: RazorpayVerificationResult) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}

export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiateRazorpayPayment(options: InitiatePaymentOptions): Promise<void> {
  const {
    bookingId,
    userId,
    userRole = 'client',
    clientName,
    clientEmail,
    clientPhone,
    onSuccess,
    onError,
    onDismiss,
  } = options;

  try {
    // 1. Ensure Razorpay checkout.js is loaded
    const isLoaded = await loadRazorpayCheckoutScript();
    if (!isLoaded) {
      onError('Unable to load Razorpay payment SDK. Please check your internet connection.');
      return;
    }

    // 2. Call backend order creation endpoint
    const createRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        userId,
        userRole,
        clientName,
        clientEmail,
        clientPhone,
      }),
    });

    const createData = await createRes.json();
    if (!createData.success || !createData.order) {
      onError(createData.error || 'Failed to initialize payment order with server.');
      return;
    }

    const { order, keyId } = createData;

    // 3. Configure Razorpay modal
    const checkoutOptions = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'ZipAdvo',
      description: `Advocate Contact & Vault Unlock - ${order.bookingReference}`,
      order_id: order.id,
      notes: order.notes,
      prefill: {
        name: clientName,
        email: clientEmail || '',
        contact: clientPhone || '',
      },
      theme: {
        color: '#1e3a8a', // ZipAdvo Navy Blue
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
        escape: true,
        backdropclose: false,
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        try {
          // 4. Server-side signature verification
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
              userId,
              userRole,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess(verifyData);
          } else {
            onError(verifyData.error || 'Server signature verification failed. Please contact support.');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Network error during signature verification';
          onError(msg);
        }
      },
    };

    if (!window.Razorpay) {
      onError('Razorpay SDK is not available');
      return;
    }

    const razorpayInstance = new window.Razorpay(checkoutOptions);
    razorpayInstance.on('payment.failed', function (resp: { error?: { description?: string; reason?: string } }) {
      const failReason = resp.error?.description || resp.error?.reason || 'Payment transaction failed';
      onError(`Payment failed: ${failReason}`);
    });

    razorpayInstance.open();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'An error occurred launching payment';
    onError(msg);
  }
}
