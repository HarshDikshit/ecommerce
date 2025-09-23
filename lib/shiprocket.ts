// lib/shiprocket.ts - Shiprocket API integration

import { server } from "@/sanity/lib/server";
import { NextResponse } from "next/server";

interface ShiprocketAuth {
  email: string;
  password: string;
}

interface ShiprocketOrderData {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  comment: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount: string;
    tax: string;
    hsn: number;
  }>;
  payment_method: string;
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

class ShiprocketAPI {
  private baseURL = 'https://apiv2.shiprocket.in/v1/external';
  private token: string | null = null;

  // Step 1: Authenticate and get token
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        this.token = data.token;
        return data.token;
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Shiprocket auth error:', error);
      throw error;
    }
  }

  // Step 2: Create order in Shiprocket
  async createOrder(orderData: ShiprocketOrderData): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseURL}/orders/create/adhoc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Order creation failed');
      }
    } catch (error) {
      console.error('Shiprocket order creation error:', error);
      throw error;
    }
  }

  // Step 3: Generate AWB (Air Waybill)
  async generateAWB(shipmentId: number, courierCompanyId: number): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseURL}/courier/assign/awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          courier_company_id: courierCompanyId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AWB generation error:', error);
      throw error;
    }
  }

  // Step 4: Track shipment
  async trackShipment(awb: string): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseURL}/courier/track/awb/${awb}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Tracking error:', error);
      throw error;
    }
  }

  // Get available couriers and rates
  async getServiceability(pickupPostcode: string, deliveryPostcode: string, weight: number, cod: boolean = false): Promise<any> {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseURL}/courier/serviceability/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Serviceability error:', error);
      throw error;
    }
  }
}

// Initialize Shiprocket instance
export const shiprocketAPI = new ShiprocketAPI();

// Helper function to convert order to Shiprocket format
export function convertOrderToShiprocketFormat(order: any, pickupLocation?: string): ShiprocketOrderData {
  return {
    order_id: order.orderNumber,
    order_date: order.orderDate,
    pickup_location: pickupLocation || "Custom",
    channel_id: "custom", // Your channel ID from Shiprocket
    comment: "Order from E-commerce site",
    billing_customer_name: order.customerName.split(' ')[0],
    billing_last_name: order.customerName.split(' ').slice(1).join(' ') || '',
    billing_address: order.address.address,
    billing_address_2: "",
    billing_city: order.address.city,
    billing_pincode: order.address.zip,
    billing_state: order.address.state,
    billing_country: "India",
    billing_email: order.customerEmail,
    billing_phone: "9999999999", // You'll need to collect this
    shipping_is_billing: true,
    order_items: order.products.map((item: any) => ({
      name: item.product.name,
      sku: item.product._id,
      units: item.quantity,
      selling_price: item.product.price,
      discount: "0",
      tax: "0",
      hsn: 0, // HSN code for your products
    })),
    payment_method: "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: order.amountDiscount || 0,
    sub_total: order.totalPrice,
    length: 10, // Package dimensions in cm
    breadth: 10,
    height: 5,
    weight: 0.5, // Weight in kg
  };
}

// API route for Shiprocket integration
// app/api/shiprocket/create-order/route.ts
export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    
    // Fetch order from Sanity
    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        customerName,
        customerEmail,
        totalPrice,
        amountDiscount,
        orderDate,
        address,
        products[]{
          quantity,
          product->{
            _id,
            name,
            price
          }
        }
      }`,
      { orderId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Convert to Shiprocket format
    const shiprocketOrderData = convertOrderToShiprocketFormat(
      order, 
      "Primary" // Your pickup location name in Shiprocket
    );

    // Create order in Shiprocket
    const shiprocketResponse = await shiprocketAPI.createOrder(shiprocketOrderData);

    // Update order in Sanity with Shiprocket details
    await server.patch(orderId).set({
      shiprocketOrderId: shiprocketResponse.order_id.toString(),
      status: "processing",
    }).commit();

    return NextResponse.json({
      success: true,
      shiprocketOrderId: shiprocketResponse.order_id,
      shipmentId: shiprocketResponse.shipment_id,
    });

  } catch (error) {
    console.error("Shiprocket order creation error:", error);
    return NextResponse.json({ error: "Failed to create shipping order" }, { status: 500 });
  }
}