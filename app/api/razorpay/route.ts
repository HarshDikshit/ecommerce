import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { server } from "@/sanity/lib/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      amount, 
      products, 
      address, 
      customerName, 
      customerEmail,
      currency = "INR",
      amountDiscount = 0 
    } = body;

    if (!amount || !products || !address || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt: `receipt-${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${userId.slice(-4)}`;

    // Create order in Sanity with pending status
    const orderDoc = {
      _type: "order",
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      clerkUserId: userId,
      customerName,
      customerEmail,
      products: products.map((item: any) => ({
        _type: "object",
        product: {
          _type: "reference",
          _ref: item.productId,
        },
        quantity: item.quantity,
      })),
      totalPrice: amount,
      currency,
      amountDiscount,
      address: {
        _type: "object",
        name: address.name,
        address: address.address,
        city: address.city,
        state: address.state,
        zip: address.zip,
        contact: address.contact,
      },
      status: "pending",
      orderDate: new Date().toISOString(),
    };

    const createdOrder = await server.create(orderDoc);

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      orderNumber,
      sanityOrderId: createdOrder._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Error while creating order" },
      { status: 500 }
    );
  }
}