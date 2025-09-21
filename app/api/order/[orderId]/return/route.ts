// app/api/orders/[orderId]/return/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { server } from "@/sanity/lib/server";

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reason, description, images, refundMethod = "original" } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Return reason is required" },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]{
        _id,
        orderNumber,
        status,
        orderDate,
        totalPrice,
        products[]
      }`,
      { orderId: params.orderId, userId }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order can be returned (only delivered orders)
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: "Only delivered orders can be returned" },
        { status: 400 }
      );
    }

    // Check return window (e.g., 7 days from delivery)
    const deliveredDate = new Date(order.orderDate); // You might want to track actual delivery date
    const returnDeadline = new Date(deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    if (new Date() > returnDeadline) {
      return NextResponse.json(
        { error: "Return window has expired (7 days from delivery)" },
        { status: 400 }
      );
    }

    // Create return request
    const returnRequest = {
      reason,
      description: description || "",
      requestedAt: new Date().toISOString(),
      images: images || [],
      refundAmount: order.totalPrice, // Full refund by default
      refundMethod,
    };

    // Update order with return request
    await server.patch(order._id).set({
      status: "refund_requested",
      returnRequest,
    }).commit();

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully",
      orderNumber: order.orderNumber,
    });

  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { error: "Failed to submit return request" },
      { status: 500 }
    );
  }
}

// Process refund (Admin endpoint)
export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const { action, refundAmount } = body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        status,
        razorpayPaymentId,
        returnRequest
      }`,
      { orderId: params.orderId }
    );

    if (!order || order.status !== 'refund_requested') {
      return NextResponse.json(
        { error: "Order not found or not in refund requested status" },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // TODO: Process actual refund with Razorpay
      // const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      //   amount: (refundAmount || order.returnRequest.refundAmount) * 100
      // });

      await server.patch(order._id).set({
        status: "refunded",
        // Add refund details when implementing Razorpay refund
      }).commit();

      return NextResponse.json({
        success: true,
        message: "Refund processed successfully",
      });
    } else {
      // Reject refund
      await server.patch(order._id).set({
        status: "delivered", // Back to delivered status
      }).commit();

      return NextResponse.json({
        success: true,
        message: "Return request rejected",
      });
    }

  } catch (error) {
    console.error("Refund processing error:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}