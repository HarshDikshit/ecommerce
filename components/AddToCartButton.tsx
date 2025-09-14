import { Product } from '@/sanity.types'
import React from 'react'
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

interface Props {
    product: Product | null | undefined;
    className?: string;
}

const AddToCartButton = ({product, className}: Props) => {
    const isOutOfStock = product?.stock === 0;
    
  return (
    <div className='w-full h-12 flex items-center'>
        <Button
            disabled={isOutOfStock}
            className={cn(
                "w-full bg-black/80 text-white/75 border border-black/55", className
            )}>
                <ShoppingBag/> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
    </div>
  )
}

export default AddToCartButton