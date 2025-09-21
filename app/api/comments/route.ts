import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const currentUserId = searchParams.get("currentUserId"); // optional

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const start = (page - 1) * limit;

  // Fetch comments
  const comments = await client.fetch(
    `*[_type == "comment" && product._ref == $productId] | order(_createdAt desc) [$start...$end]{
      _id,
      text,
      rating,
      authorClerkId,
      authorName,
      images,
      _createdAt
    }`,
    { productId, start, end: start + limit }
  );

  // Map images to full URLs and mark current user
  const mappedComments = comments.map((c: any) => ({
    ...c,
    images: c.images?.map((img: any) => urlFor(img).url()),
    isCurrentUser: currentUserId ? c.authorClerkId === currentUserId : false,
  }));

  const total = await client.fetch(
    `count(*[_type == "comment" && product._ref == $productId])`,
    { productId }
  );

  return NextResponse.json({
    comments: mappedComments,
    totalPages: Math.ceil(total / limit),
  });
}
