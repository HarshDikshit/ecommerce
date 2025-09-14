import { Product } from '@/sanity.types'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface Props{
    product: Product | null | undefined;
    showProduct: boolean;
}
const FavoriteButton = ({product, showProduct}: Props) => {
  return (

    <>
     {!showProduct ? (
        <Link href={"/cart"} className='group relative'>
        <Heart className='w-5 h-5 hover:text-black hoverEffect'/>
        <span className='absolute -top-1 -right-1  text-white bg-black/80 h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center'>0</span>
    </Link>
     ): (
        <button className='group relative hover:text-maroon/45 hoverEffect border border-maroon/80 hover:border-maroon p-1.5 rounded-sm'>
        <Heart className='text-maroon/80 group-hover:text-maroon mt-0.5 w-5 h-5 hoverEffect'/>
        </button>
     )}
    </>
    
  )
}

export default FavoriteButton