import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Product from "../../../../models/Product";
import { uploadImages } from "@/lib/cloudinary";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const product = await Product.findById(params.id);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const data = JSON.parse(formData.get("data") as string);
    let imageUrls: string[] = data.images || []; // Existing images
    if (files.length > 0) {
      const newUrls = await uploadImages(files);
      imageUrls = [...imageUrls, ...newUrls]; // Append new images
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      { ...data, images: imageUrls },
      { new: true }
    );
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
