import { Product } from "@/sanity.types";
import ProductCard from "./ProductCard";

interface ProductList extends Product {
  imagesArray: string[];
}
export default async function Products({ products }: { products?: ProductList[]}) {

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {products?.map((product:ProductList) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
