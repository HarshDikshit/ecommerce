import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import FavoriteButton from "@/components/FavoriteButton";
import ImageView from "@/components/ImageView";
import PriceView from "@/components/PriceView";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import { cn } from "@/lib/utils";
import { getProductBySlug, getProducts } from "@/sanity/queries";
import Rating from "@mui/material/Rating";
import React from "react";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";
import { FiShare2 } from "react-icons/fi";
import { FaRegQuestionCircle } from "react-icons/fa";
import { CornerDownLeft, Truck } from "lucide-react";
import CommentSection from "@/components/Comments";
import Products from "@/components/Products";
import { Product } from "@/sanity.types";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) as Product;
  const isStock = (product?.stock as number) > 0;

  const categoryIds = product?.categories?.map((cat) => cat._ref) ?? [];


  const suggesteProducts: any = await getProducts(8, {
     purpose: [...product?.purpose as string[]], bead: [...product?.bead as string[]] 
  });


  return (
    <Container className="space-y-12">
      <div className="flex flex-col md:flex-row gap-10 py-10">
        {product?.images && (
          <ImageView images={product?.images} isStock={product?.stock} />
        )}

        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{product?.name}</h2>
            <p className="text-sm text-gray-600 tracking-wide">
              {product?.description}
            </p>
            <Rating
              name="half-rating-read"
              defaultValue={4.5}
              value={product?.averageRating}
              precision={0.5}
              size="small"
              readOnly
            />
            <div className="border-t border-b border-gray-200 py-5 space-y-2">
              <PriceView
                price={product?.price as number}
                discount={product?.discount}
                className="mt-2 text-xl"
              />
            </div>
            <p
              className={cn(
                "px-4 py-1.5 font-semibold rounded-lg  inline-block text-center text-sm",
                product?.stock === 0 ?
                  "bg-red-100 text-red-600"
                : "text-green-600 bg-green-100"
              )}
            >
              {(product?.stock as number) > 0 ? "In Stock" : "Out of Stock"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 lg:gap-3">
            <AddToCartButton product={product} />
            <FavoriteButton product={product} showProduct={true} />
          </div>
          <ProductCharacteristics product={product} />
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
            <div className="flex items-center gap-2 text-sm text-black  hover:text-red-600 hoverEffect cursor-pointer">
              <RxBorderSplit className="text-lg" />
              <p>Compare Color</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect cursor-pointer">
              <FaRegQuestionCircle className="text-lg" />
              <p>Ask a question</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect cursor-pointer">
              <TbTruckDelivery className="text-lg" />
              <p>Delievery</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect cursor-pointer">
              <FiShare2 className="text-lg" />
              <p>Share</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="border border-black/25 border-b-0 p-3 flex items-center gap-2.5">
              <Truck size={30} className="text-maroon/30" />
              <div>
                <p className="text-base font-semibold text-black">
                  Free Delievery
                </p>
                <p className="text-sm text-gray-500 underline underline-offset-2">
                  Check our delivery Policy.
                </p>
              </div>
            </div>
            <div className="border border-black/25 p-3 flex items-center gap-2.5">
              <CornerDownLeft size={30} className="text-maroon/30" />
              <p className="text-base font-semibold text-black">
                Return Policy
              </p>
              <p className="text-sm text-gray-500">
                Free 30 days Delievery Returns.{" "}
                <span className="underline underline-offset-2">Details</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight">
          Similar Products, May You Love
        </div>
        <Products products={suggesteProducts} />
      </div>
      <CommentSection productId={product._id} />
    </Container>
  );
};

export default SingleProductPage;
