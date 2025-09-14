import { Product } from '@/sanity.types'
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

const ProductCharacteristics = async({product}: {product: Product | null | undefined}) => {
    
  return (
    <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
            <AccordionTrigger>{product?.name}: Characteristics</AccordionTrigger>
            <AccordionContent>
                <p className='capitalize flex items-center justify-between'>Purpose: <span className='font-semibold tracking-wide'>{product?.purpose?.at(0)}</span></p>
                <p className='capitalize flex items-center justify-between'>Bead: <span className='font-semibold tracking-wide'>{product?.bead?.at(0)}</span></p>
                <p className='capitalize flex items-center justify-between'>Stock: <span className='font-semibold tracking-wide'>{product?.stock ? "Available": "Out of Stock"}</span></p>
            </AccordionContent>
        </AccordionItem>

    </Accordion>
  )
}

export default ProductCharacteristics