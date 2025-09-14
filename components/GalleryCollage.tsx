"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  slug: string;
  galleryImage: string;
}

export default function GalleryCollage({ products }: { products: Product[] }) {
  return (
    <section className="px-6 my-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight">
        Explore Our <span className="text-pink-500">Collection</span> ✨
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {products.slice(0, 8).map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300 aspect-square"
          >
            <Link href={`/product/${product.slug}`}>
              <Image
                src={product.galleryImage}
                alt={product.name}
                fill
                className="object-cover rounded-lg transform transition duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
