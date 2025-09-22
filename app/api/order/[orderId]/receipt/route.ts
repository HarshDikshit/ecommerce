// app/api/orders/[orderId]/receipt/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { server } from "@/sanity/lib/server";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";


export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> } 
) {
  try {
    const { orderId } = await context.params;
    const fontRegular = path.resolve(
      process.cwd(),
      "public/fonts/times.ttf"
    );
    const fontBold = path.resolve(
      process.cwd(),
      "public/fonts/segoeui.ttf"
    );
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch order details
    const order = await server.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]{
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
        products[]{
          quantity,
          product->{
            _id,
            name,
            price,
            images
          }
        }
      }`,
      { orderId: orderId, userId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate verification URL for QR code
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-receipt/${order._id}`;

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 150,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, left: 50, right: 50, bottom: 50 },
      font: fontRegular,
    });

    // Create a ReadableStream from the PDF
    const stream = new ReadableStream({
      start(controller) {
        doc.on("data", (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        doc.on("end", () => {
          controller.close();
        });

        doc.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    // Header
    doc
      .fontSize(24)
      .font(fontBold)
      .text("PURCHASE RECEIPT", 50, 50, { align: "center" });

    doc
      .fontSize(12)
      .font(fontRegular)
      .text(`Order #: ${order.orderNumber}`, 50, 100)
      .text(
        `Date: ${new Date(order.orderDate).toLocaleDateString("en-IN")}`,
        50,
        115
      )
      .text(`Status: ${order.status.toUpperCase()}`, 50, 130);

    // Customer Details
    doc.fontSize(14).font(fontBold).text("BILLING INFORMATION", 50, 170);

    doc
      .fontSize(10)
      .font(fontRegular)
      .text(`Name: ${order.customerName}`, 50, 190)
      .text(`Email: ${order.customerEmail}`, 50, 205)
      .text(`Address: ${order.address.address}`, 50, 220)
      .text(
        `City: ${order.address.city}, ${order.address.state} ${order.address.zip}`,
        50,
        235
      )
      .text(`Contact: ${order.address.contact}`, 50, 250);

    // Products Table Header
    const tableTop = 280;
    doc
      .fontSize(14)
      .font(fontBold)
      .text("ITEMS PURCHASED", 50, tableTop - 20);

    doc
      .fontSize(10)
      .font(fontBold)
      .text("Product", 50, tableTop)
      .text("Qty", 300, tableTop)
      .text("Price", 350, tableTop)
      .text("Total", 450, tableTop);

    // Draw line under header
    doc
      .strokeColor("#000000")
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Products
    let currentY = tableTop + 30;
    let subtotal = 0;

    order.products.forEach((item: any) => {
      const lineTotal = item.product.price * item.quantity;
      subtotal += lineTotal;

      doc
        .fontSize(10)
        .font(fontRegular)
        .text(item.product.name, 50, currentY, { width: 240 })
        .text(item.quantity.toString(), 300, currentY)
        .text(`₹${item.product.price}`, 350, currentY)
        .text(`₹${lineTotal}`, 450, currentY);

      currentY += 20;
    });

    // Totals
    const totalsY = currentY + 20;
    doc
      .strokeColor("#000000")
      .lineWidth(1)
      .moveTo(300, totalsY)
      .lineTo(550, totalsY)
      .stroke();

    doc
      .fontSize(10)
      .font(fontRegular)
      .text("Subtotal:", 350, totalsY + 10)
      .text(`₹${subtotal}`, 450, totalsY + 10)
      .text("Total Paid:", 350, totalsY + 25)
      .font(fontBold)
      .text(`₹${order.totalPrice}`, 450, totalsY + 25);

    // Payment Information
    if (order.razorpayPaymentId) {
      doc
        .fontSize(12)
        .font(fontBold)
        .text("PAYMENT INFORMATION", 50, totalsY + 60);

      doc
        .fontSize(10)
        .font(fontRegular)
        .text(`Payment ID: ${order.razorpayPaymentId}`, 50, totalsY + 80)
        .text(`Payment Method: Online Payment`, 50, totalsY + 95);
    }

    // QR Code for verification
    doc
      .fontSize(12)
      .font(fontBold)
      .text("RECEIPT VERIFICATION", 350, totalsY + 60);

    // Add QR code image (convert base64 to buffer)
    const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(",")[1], "base64");
    doc.image(qrCodeBuffer, 350, totalsY + 80, { width: 100 });

    doc
      .fontSize(8)
      .font(fontRegular)
      .text("Scan to verify receipt authenticity", 350, totalsY + 190, {
        width: 100,
        align: "center",
      });

    // Footer
    doc
      .fontSize(8)
      .font(fontRegular)
      .text("Thank you for your purchase!", 50, 750, { align: "center" })
      .text("This is a computer-generated receipt.", 50, 765, {
        align: "center",
      });

    // Finalize PDF
    doc.end();

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
