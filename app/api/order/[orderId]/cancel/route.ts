// app/api/orders/[orderId]/cancel/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { server } from "@/sanity/lib/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params object
    const { orderId } = await params;

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
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
        cancellationDeadline,
        products[]{
          product->{_id, stock},
          quantity
        }
      }`,
      { orderId, userId }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const cancellationDeadline = order.cancellationDeadline
      ? new Date(order.cancellationDeadline)
      : new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours default

    if (now > cancellationDeadline) {
      return NextResponse.json(
        { error: "Order cancellation window has expired" },
        { status: 400 }
      );
    }

    // Check if order status allows cancellation
    const cancellableStatuses = ['pending', 'processing', 'paid'];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    await server.patch(order._id).set({
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: now.toISOString(),
    }).commit();

    // Restore product stock
    const stockUpdates = order.products.map(async (item: any) => {
      const newStock = item.product.stock + item.quantity;
      return server.patch(item.product._id).set({
        stock: newStock
      }).commit();
    });

    await Promise.all(stockUpdates);

    // TODO: Initiate refund process with Razorpay
    // This would involve calling Razorpay's refund API

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}