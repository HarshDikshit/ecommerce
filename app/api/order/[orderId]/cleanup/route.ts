// app/api/orders/[orderId]/cleanup/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { server } from "@/sanity/lib/server";

export async function DELETE(
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

    // Fetch the order to verify it belongs to the user and is pending
    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]{
        _id,
        orderNumber,
        status,
        orderDate,
        products[]{
          product->{_id, stock},
          quantity
        }
      }`,
      { orderId, userId }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    // Only allow cleanup of pending orders
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cleanup pending orders" },
        { status: 400 }
      );
    }

    // Check if order is recent (within last hour to prevent abuse)
    const orderTime = new Date(order.orderDate).getTime();
    const now = new Date().getTime();
    const timeDiff = now - orderTime;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (timeDiff > oneHour) {
      return NextResponse.json(
        { error: "Order too old for cleanup" },
        { status: 400 }
      );
    }

    // Restore product stock (since it might have been reserved)
    const stockRestorePromises = order.products.map(async (item: any) => {
      // Note: If you're reserving stock on order creation, restore it here
      // For now, this is a placeholder as your current system doesn't reserve stock
      return Promise.resolve();
     
      // If you implement stock reservation, uncomment below:
      // const newStock = item.product.stock + item.quantity;
      // return server.patch(item.product._id).set({
      //   stock: newStock
      // }).commit();
    });

    await Promise.all(stockRestorePromises);

    // Delete the pending order
    await server.delete(order._id);

    console.log(`Cleaned up pending order: ${order.orderNumber}`);

    return NextResponse.json({
      success: true,
      message: "Pending order cleaned up successfully",
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup order" },
      { status: 500 }
    );
  }
}