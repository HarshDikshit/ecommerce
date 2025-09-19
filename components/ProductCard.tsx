"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingBag, ShoppingCart, StarIcon, TagIcon } from "lucide-react";
import { IoStarSharp } from "react-icons/io5";
import { IoStarHalfSharp } from "react-icons/io5";
import { FaShoppingBasket } from "react-icons/fa";
import Rating from '@mui/material/Rating';
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import { Product } from "@/sanity.types";
import Link from "next/link";
import ProductSideMenu from "./ProductSideMenu";



export default function ProductCard({product} : {product: Product 
}) {
  const [hovered, setHovered] = useState(false);
  const beforePrice = product.discount ? product.price *(1 + product.discount/100) : null;

  return (
    <div
      className="relative w-full h-fit bg-white shadow-md overflow-hidden cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product?.slug.current}`}>
      {/* Image Section */}
      <div className="relative w-full h-44 overflow-hidden">
        <div className="absolute top-0 left-0 py-1 px-2 bg-red-800 text-white text-sm font-seigeui z-20 flex items-center justify-center gap-2"><TagIcon size={15}/> Upto {product.discount}% off</div>
        <img
          src={product?.imagesArray?.[0]}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={product?.imagesArray?.[1]}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <ProductSideMenu product={product}/>
      </div>
      </Link>
      {/* Details Section */}
      <div className="p-4">
        <h3 className="text-lg font-seigeui font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
        

         {/* Rating Stars */}
        <div className="flex mt-2">
          <Rating name="half-rating-read" defaultValue={4.5} precision={0.5} size="small" readOnly />
          <p className="text-sm text-gray-500 ml-4">({product.stock})</p>
        </div>

          <PriceView price={product?.price} discount={product?.discount} className="mt-2"/>
          <AddToCartButton product={product}/>
      </div>
    </div>
  );
}
