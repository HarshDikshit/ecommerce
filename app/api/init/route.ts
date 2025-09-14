import connectDB from "@/lib/db";
import { syncAdmin } from "@/lib/syncAdmin";
import { NextResponse } from "next/server";

export async function POST() {
  await connectDB();

  try {
    await syncAdmin();
    return NextResponse.json({ message: "Admin synced" });
  } catch (error) {
    return NextResponse.json(
      { error: error  },
      { status: 500 }
    );
  }
}
