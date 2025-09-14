import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Order from "../../../../models/Order";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const { status } = await req.json();
    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
