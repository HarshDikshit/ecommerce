import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { userId, sessionId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // const order = await razorpay.orders.create({
    //     amount: price * 100,
    //     currency:  'INR',
    //     receipt: `receipt-${Date.now()}`,
    //     notes: {
    //         price
    //     }
    // })

    const options = {
      amount: body.amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt-${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
    })
  } catch (error) {
    console.error(error);
    return NextResponse.json(
        {error: "Error while payment"},
        {status: 500},
    )
    
  }
}
