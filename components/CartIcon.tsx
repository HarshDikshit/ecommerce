"use client";
import useStore from '@/store'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const CartIcon = () => {
    const {items} = useStore();
  return (
    <Link href={"/cart"} className='relative group'>
        <ShoppingBag className="w-5 h-5 hover:text-white/25 hoverEffect"/>
        <span className='absolute -top-1 -right-1  text-white bg-black/80 h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center'>
            {items?.length ? items.length : 0}
        </span>
    </Link>
  )
}

export default CartIcon