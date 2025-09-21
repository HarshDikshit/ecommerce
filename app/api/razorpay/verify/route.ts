import { NextResponse } from "next/server";
import crypto from "crypto";
import { server } from "@/sanity/lib/server";

export async function POST(req: Request) {
  try {
    // Check if request has content
    const contentLength = req.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { success: false, message: "Empty request body" },
        { status: 400 }
      );
    }

    // Parse JSON with error handling
    let requestData;
    try {
      const text = await req.text();
      
      if (!text || text.trim() === '') {
        throw new Error("Empty request body");
      }
      
      requestData = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = requestData;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      
      return NextResponse.json(
        { success: false, message: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      try {
        // Find the order in Sanity using razorpayOrderId
        const order = await server.fetch(
          `*[_type == "order" && razorpayOrderId == $razorpayOrderId][0]{
            _id,
            orderNumber,
            products[]{
              product->{_id, stock},
              quantity
            }
          }`,
          { razorpayOrderId: razorpay_order_id }
        );

        if (!order) {
          return NextResponse.json(
            { success: false, message: "Order not found" },
            { status: 404 }
          );
        }

        // Update order status and add payment details
        await server.patch(order._id).set({
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        }).commit();


        // Update product stock for each purchased item
        const stockUpdates = order.products.map(async (item: any) => {
          const newStock = Math.max(0, item.product.stock - item.quantity);
          console.log(`Updating stock for product ${item.product._id}: ${item.product.stock} -> ${newStock}`);
          return server.patch(item.product._id).set({
            stock: newStock
          }).commit();
        });

        await Promise.all(stockUpdates);
        console.log("Stock updated for all products");

        return NextResponse.json({
          success: true,
          message: "Payment verified and order updated",
          orderId: order._id,
          orderNumber: order.orderNumber
        });

      } catch (dbError) {
        console.error("Database update error:", dbError);
        return NextResponse.json({
          success: true, // Payment is still valid
          message: "Payment verified but order update failed",
          warning: "Manual intervention required"
        });
      }

    } else {
      console.error("Invalid signature:", {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}