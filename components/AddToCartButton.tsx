"use client";
import { Product } from '@/sanity.types'
import React from 'react'
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import useStore from '@/store';
import toast from 'react-hot-toast';
import PriceView from './PriceView';
import QuantityButtons from './QuantityButtons';

interface Props {
    product: Product;
    className?: string;
}

const AddToCartButton = ({product, className}: Props) => {  
    const {addItem, getItemCount} = useStore();
    const itemCount = getItemCount(product?._id)
    const isOutOfStock = product?.stock === 0;

    const handleAddToCart = () => {
        if((product?.stock as number) > itemCount) {
            addItem(product);
            toast.success(
                `${product?.name?.substring(0, 12)}... added successfully!`
            )
        } else {
            toast.error("Can not add more than available  stock")
        }
    }
    
  return (
    <div className='w-full h-12 flex items-center'>

        {itemCount ? 
        <div className='text-sm w-full'>
            <div className='flex items-center justify-between'>
                <span className='text-xs text-black/80 '>Quantity</span>
                <QuantityButtons product={product}/>
            </div>
            <div className='flex items-center justify-between border-t pt-1'>
                <span className='text-xs font-semibold'>Subtotal</span>
                <PriceView className='' discount={product?.discount} price={product?.price ? product?.price * itemCount : 0}/>
            </div>
        </div>
        :
        <Button
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={cn(
                "w-full bg-black/80 text-white/75 border border-black/55", className
            )}>
                <ShoppingBag/> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
        }
        
    </div>
  )
}

export default AddToCartButton