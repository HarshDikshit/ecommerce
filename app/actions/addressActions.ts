"use server";

import { server } from "@/sanity/lib/server";
import { auth } from "@clerk/nextjs/server";

export async function createAddress(data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  // Log the data to identify problematic characters
  console.log("Address data:", JSON.stringify(data, null, 2));
  
  // Check each field for problematic characters
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const hasInvalidChars = /[<>"'`]/.test(value);
      if (hasInvalidChars) {
        console.warn(`Field "${key}" contains potentially invalid characters:`, value);
      }
    }
  });

  const newAddress = {
    _type: "address",
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  };

  try {
    const doc = await server.create(newAddress);
    return doc;
  } catch (error) {
    console.error("Sanity create error:", error);
    throw error;
  }
}

export async function deleteAddress(addressId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  try {
    // First verify that the address belongs to the current user
    const address = await server.fetch(
      `*[_type == "address" && _id == $addressId && userId == $userId][0]`,
      { addressId, userId }
    );

    if (!address) {
      throw new Error("Address not found or you don't have permission to delete it");
    }

    // Delete the address
    const result = await server.delete(addressId);
    console.log("Address deleted successfully:", addressId);
    
    return { success: true, deletedId: addressId };
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error(`Failed to delete address`);
  }
}
