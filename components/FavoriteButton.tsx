"use client";
import { Product } from '@/sanity.types'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import useStore from '@/store';

interface Props{
    product?: Product | null | undefined;
    showProduct: boolean;
}
const FavoriteButton = ({product, showProduct}: Props) => {
  const {favoriteProduct, addToFavorite} = useStore();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item) => item?._id === product?._id
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    if (product?._id) {
      addToFavorite(product);
    }
  }
  return (

    <>
     {!showProduct ? (
        <Link href={"/wishlist"} className='group relative'>
        <Heart className='w-5 h-5 hover:text-black hoverEffect'/>
        <span className='absolute -top-1 -right-1  text-white bg-black/80 h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center'>
        {favoriteProduct?.length ? favoriteProduct?.length : 0}
        </span>
    </Link>
     ): (
        <Button onClick={handleFavorite} className='group relative hover:text-maroon/45 hoverEffect border border-maroon/80 hover:border-maroon p-1.5 rounded-sm '>
          {existingProduct?
          <Heart fill='#800000' className='group-hover:text-maroon mt-0.5 w-5 h-5 hoverEffect'/> 
          :
          <Heart className='group-hover:text-maroon mt-0.5 w-5 h-5 hoverEffect'/> }
        
        </Button>
     )}
    </>
    
  )
}

export default FavoriteButton