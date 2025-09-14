import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Order from "../../../models/Order";

export async function GET() {
  await connectDB();
  try {
    const orders = await Order.find().populate("userId", "name");
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
