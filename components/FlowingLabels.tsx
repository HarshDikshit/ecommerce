import React from 'react'
import { Button } from './ui/button'

function FlowingLabels() {
  return (
    <div className="infinite-strip z-10">
            <div className="strip-wrapper">
              <div className="strip-content animate-wave flex space-x-8">
              <div>Book your consulation @ <span className='text-red-400 '>Rs.699</span><span className='line-through text-gray-400 ml-2'>Rs.899</span></div>
              <div>Slots are limited. <Button className='bg-amber-800 font-semibold text-white ml-2'> Reserve yours now!!</Button></div>
              <div>Book your consulation @ <span className='text-red-400 '>Rs.699</span><span className='line-through text-gray-400 ml-2'>Rs.899</span></div>
              <div>Slots are limited. <Button className='bg-amber-800 font-semibold text-white ml-2'> Reserve yours now!!</Button></div>
              <div>Book your consulation @ <span className='text-red-400 '>Rs.699</span><span className='line-through text-gray-400 ml-2'>Rs.899</span></div>
              <div>Slots are limited. <Button className='bg-amber-800 font-semibold text-white ml-2'> Reserve yours now!!</Button></div>
              <div>Book your consulation @ <span className='text-red-400 '>Rs.699</span><span className='line-through text-gray-400 ml-2'>Rs.899</span></div>
              <div>Slots are limited. <Button className='bg-amber-800 font-semibold text-white ml-2'> Reserve yours now!!</Button></div>
            </div>
          </div>
          </div>
  )
}

export default FlowingLabels