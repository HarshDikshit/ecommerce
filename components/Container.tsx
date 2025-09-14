import { cn } from '@/lib/utils'
import React from 'react'

function Container({children, className}: {children: React.ReactNode, className?: string}) {
  return (
    <div className={cn('relative flex mb-4 px-4 flex-col lg:px-20  md:px-8 ', className)}>{children}</div>
  )
}

export default Container