import ProductCard from "./ProductCard";
import Link from "next/link";
import { Product } from "@/app/(client)/page";

export default async function Products({ slug, products }: { slug?: string , products?: Product[]}) {

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {products?.map((product:any) => (
        <Link href={`/product/${product?.slug.current}`}>

        <ProductCard key={product._id} product={product} />
        </Link>
      ))}
    </div>
  );
}
