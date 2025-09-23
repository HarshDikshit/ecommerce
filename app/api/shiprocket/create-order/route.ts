import { enhancedShiprocketAPI } from "@/lib/shiprocket";
import { server } from "@/sanity/lib/server";
import { NextResponse } from "next/server";

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
    const shiprocketOrderData = enhancedShiprocketAPI.convertToTestOrder(
      order, 
       // Your pickup location name in Shiprocket
    );

    // Create order in Shiprocket
    const shiprocketResponse = await enhancedShiprocketAPI.createOrder(shiprocketOrderData);

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