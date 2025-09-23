// app/api/orders/[orderId]/refund/route.ts - Enhanced refund API
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { server } from "@/sanity/lib/server";
import { razorpayRefundService } from "@/lib/razorpay-refund";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();
    const { orderId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      refundType = 'full', // 'full' | 'partial'
      refundAmount, 
      reason,
      speed = 'normal' // 'normal' | 'optimum'
    } = body;

    // Fetch order
    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]{
        _id,
        orderNumber,
        totalPrice,
        status,
        razorpayPaymentId,
        products[]{
          quantity,
          product->{_id, stock}
        }
      }`,
      { orderId: orderId, userId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate refund conditions
    if (!['paid', 'delivered', 'shipped'].includes(order.status)) {
      return NextResponse.json({
        error: "Order cannot be refunded. Current status: " + order.status
      }, { status: 400 });
    }

    if (!order.razorpayPaymentId) {
      return NextResponse.json({
        error: "No payment found for this order"
      }, { status: 400 });
    }

    // Calculate refund amount
    const maxRefundAmount = order.totalPrice;
    const finalRefundAmount = refundType === 'partial' ? 
      Math.min(refundAmount || maxRefundAmount, maxRefundAmount) : 
      maxRefundAmount;

    try {
      // Create refund in Razorpay
      const refundResponse = await razorpayRefundService.createRefund({
        paymentId: order.razorpayPaymentId,
        amount: refundType === 'full' ? undefined : finalRefundAmount,
        speed,
        notes: {
          order_id: order.orderNumber,
          reason: reason || 'Customer request',
          refund_type: refundType,
        },
        receipt: `refund_${order.orderNumber}_${Date.now()}`,
      });

      // Update order in Sanity
      await server.patch(order._id).set({
        status: 'refund_processing',
        refundDetails: {
          _type: 'object',
          refundId: refundResponse.id,
          refundAmount: refundResponse.amount / 100, // Convert back to rupees
          refundStatus: refundResponse.status,
          refundType,
          reason: reason || 'Customer request',
          initiatedAt: new Date().toISOString(),
          razorpayRefundId: refundResponse.id,
        }
      }).commit();

      // Restore stock if full refund
      if (refundType === 'full') {
        const stockUpdates = order.products.map(async (item: any) => {
          const newStock = item.product.stock + item.quantity;
          return server.patch(item.product._id).set({
            stock: newStock
          }).commit();
        });
        await Promise.all(stockUpdates);
      }

      return NextResponse.json({
        success: true,
        message: "Refund initiated successfully",
        refundId: refundResponse.id,
        refundAmount: refundResponse.amount / 100,
        status: refundResponse.status,
        estimatedProcessingTime: refundResponse.speed_requested === 'optimum' ? 
          '1-3 business days' : '5-7 business days'
      });

    } catch (razorpayError: any) {
      console.error("Razorpay refund error:", razorpayError);
      
      // Handle specific Razorpay errors
      if (razorpayError.statusCode === 400) {
        return NextResponse.json({
          error: "Invalid refund request: " + razorpayError.error?.description
        }, { status: 400 });
      }

      return NextResponse.json({
        error: "Refund failed: " + (razorpayError.error?.description || 'Unknown error')
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Refund API error:", error);
    return NextResponse.json({
      error: "Failed to process refund"
    }, { status: 500 });
  }
}

// GET - Check refund status
export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]{
        _id,
        orderNumber,
        razorpayPaymentId,
        refundDetails
      }`,
      { orderId: params.orderId, userId }
    );

    if (!order || !order.refundDetails?.refundId) {
      return NextResponse.json({ error: "No refund found" }, { status: 404 });
    }

    // Get latest refund status from Razorpay
    const refundStatus = await razorpayRefundService.getRefund(
      order.razorpayPaymentId,
      order.refundDetails.refundId
    );

    // Update status in Sanity if changed
    if (refundStatus.status !== order.refundDetails.refundStatus) {
      await server.patch(order._id).set({
        'refundDetails.refundStatus': refundStatus.status,
        ...(refundStatus.status === 'processed' && { status: 'refunded' }),
      }).commit();
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refundStatus.id,
        amount: refundStatus.amount / 100,
        status: refundStatus.status,
        createdAt: new Date(refundStatus.created_at * 1000).toISOString(),
        notes: refundStatus.notes,
      }
    });

  } catch (error) {
    console.error("Get refund status error:", error);
    return NextResponse.json({
      error: "Failed to get refund status"
    }, { status: 500 });
  }
}