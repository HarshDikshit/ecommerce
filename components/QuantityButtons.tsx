"use client";
import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types'
import useStore from '@/store';
import React from 'react'
import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    product: Product;
    className?: string;
}

const QuantityButtons = ({product, className} : Props) => {
    const {addItem, removeItem, getItemCount} = useStore();
    const itemCount = getItemCount(product?._id);
    const isOutOfStock = product?.stock === 0;

    const handleRemoveProduct = () => {
        removeItem(product?._id);
        if (itemCount > 1) {
            
        } else {
            toast.success(`${product?.name?.substring(0, 12)}... removed successfully!`)
        }
    }
    const handleAddProduct = () => {
        if ((product?.stock as number) > itemCount) {
            addItem(product);
        } else {
            toast.success(`Cannot add more products than available stock`)
        }
    }

  return (
    <div className={cn('flex items-center justify-between gap-1 pb-1 text-base', )}>
        <Button
            onClick={handleRemoveProduct}
            variant='outline'
            size='icon'
            disabled={itemCount ===0 || isOutOfStock}
            className='w-6 h-6 border-[1px] hover:bg-black/20 hoverEffect'
            >
            <Minus/>
        </Button>
        <span className='font-semibold text-sm w-6 text-center text-black/80'>{itemCount}</span>
        <Button
            onClick={handleAddProduct}
            variant='outline'
            size='icon'
            disabled={itemCount ===0 || isOutOfStock}
            className='w-6 h-6 border-[1px] hover:bg-black/20 hoverEffect'
            >
            <Plus/>
        </Button>
    </div>
  )
}

export default QuantityButtons