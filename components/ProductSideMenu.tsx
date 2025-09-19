import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types'
import useStore from '@/store'
import { Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const ProductSideMenu = ({product, className}: {product: Product, className?: string}) => {
    const {favoriteProduct, addToFavorite} = useStore();
    const [existingProduct, setexistingProduct] = useState<Product | null>(null);

    useEffect(()=> {
        const availableProduct = favoriteProduct?.find(
            (item) => item?._id === product?._id
        );
        setexistingProduct(availableProduct || null);
    },[product, favoriteProduct]);
    const handleFavorite = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        if( product?._id) {
            addToFavorite(product);
        }
    }
  return (
    <div className={cn("absolute top-2 right-2", className)}>
        <div onClick={handleFavorite} className={`p-2.5 rounded-full hover:bg-maroon/80 hover:text-white hoverEffect ${existingProduct ? "bg-maroon/80" : "bg-white/30"}`}>
        <Heart size={15} color={existingProduct ? "white" : "#000"}/>
        </div>
    </div>
  )
}

export default ProductSideMenu