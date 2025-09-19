import { cn } from '@/lib/utils';
import React from 'react'

const PriceView = ({price, discount, className}: {price: number, discount?: number, className?: string}) => {
    const beforePrice = discount ? price *(1 + discount/100) : null;
  return (
    <div className={cn(className, "flex items-center gap-2")}>
          <span className=" font-seigeui font-semibold  text-black/80">₹{price}<sup >00</sup></span>
          {beforePrice && (
            <span className=" text-gray-400 line-through">
              ₹{beforePrice.toFixed(0)}
            </span>
          )}
        </div>
  )
}

export default PriceView