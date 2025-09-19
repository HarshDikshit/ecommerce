import { Product } from "@/sanity.types";
import ProductCard from "./ProductCard";
import Link from "next/link";

export default async function Products({ slug, products }: { slug?: string , products?: Product[]}) {

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {products?.map((product:Product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
