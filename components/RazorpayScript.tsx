// Create a new component: components/RazorpayScript.tsx
"use client";

import { useEffect } from 'react';

const RazorpayScript = () => {
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        // Check if script is already loaded
        if (window.Razorpay) {
          resolve(window.Razorpay);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          resolve(window.Razorpay);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  return null;
};

export default RazorpayScript;