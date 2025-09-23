// app/api/orders/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { server } from "@/sanity/lib/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch orders for the current user
    const orders = await server.fetch(
      `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
        _id,
        orderNumber,
        customerName,
        customerEmail,
        totalPrice,
        currency,
        status,
        orderDate,
        address,
        razorpayPaymentId,
        razorpayOrderId,
        amountDiscount,
        products[]{
          quantity,
          product->{
            _id,
            name,
            images,
            price,
            discount,
            slug
          }
        }
      }`,
      { userId }
    );

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}

// Update order status (for admin or system use)
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const updatedOrder = await server.patch(orderId).set({
      status,
    }).commit();

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error updating order" },
      { status: 500 }
    );
  }
}