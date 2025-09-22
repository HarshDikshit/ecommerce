// components/RazorpayScript.tsx
"use client";
import { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayScript = () => {
  useEffect(() => {
    const loadRazorpayScript = (): Promise<typeof Razorpay | null> => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.Razorpay) {
          resolve(window.Razorpay);
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.Razorpay));
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          resolve(window.Razorpay || null);
        };
        
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          reject(new Error('Failed to load Razorpay script'));
        };
        
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().catch((error) => {
      console.error('Razorpay script loading error:', error);
    });

    // Cleanup function to remove script if component unmounts
    return () => {
      const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return null;
};

export default RazorpayScript;