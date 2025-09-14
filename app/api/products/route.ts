import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Product from "../../../models/Product";
import { uploadImages } from "@/lib/cloudinary";

export async function GET() {
  await connectDB();
  try {
    const products = await Product.find();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  try {
    const formData = await req.formData();
  const files = formData.getAll('images') as File[];
  const data = JSON.parse(formData.get('data') as string);

  let imageUrls: string[] = [];
  if (files.length > 0) {
    imageUrls = await uploadImages(files);
  }

  const product = await Product.create({ ...data, images: imageUrls });
  return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
