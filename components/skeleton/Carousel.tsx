import React from 'react'
import { Skeleton } from '../ui/skeleton'

function Carousel() {
  return (
     <div className="flex items-center space-x-4">
      <Skeleton className="rounded-lg w-full h-[80vh] p-14" />
    </div>
  )
}

export default Carousel