// File: app/actions/commentActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { server } from "@/sanity/lib/server";

// Create Comment with rating
export async function createComment(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Fetch current user details from Clerk
  const user = await currentUser();
  const authorName = user?.fullName || user?.username || "Anonymous";

  const productId = formData.get("productId") as string;
  const text = formData.get("text") as string;
  const rating = parseFloat(formData.get("rating") as string);

  if (!rating || rating < 0.5 || rating > 5) {
    throw new Error("Rating is required and must be between 0.5 and 5");
  }

  // Handle image uploads
  const images: any[] = [];
  const files = formData.getAll("images") as File[];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await server.assets.upload("image", buffer, {
      filename: file.name,
    });
    images.push({
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    });
  }

  // Create comment doc
  const doc = {
    _type: "comment",
    text: text || "",
    product: { _type: "reference", _ref: productId },
    authorClerkId: userId,
    authorName,
    rating,
    images,
  };

  const created = await server.create(doc);

  // Recalculate average rating for the product
  const ratings: number[] = await server.fetch(
    `*[_type == "comment" && product._ref == $productId].rating`,
    { productId }
  );

  const avg =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : rating;

  await server.patch(productId).set({ averageRating: avg }).commit();

  revalidatePath(`/product/${productId}`);

  return created;
}
