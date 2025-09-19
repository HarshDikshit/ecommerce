import NoAccess from '@/components/NoAccess';
import WishlistProducts from '@/components/WishlistProducts';
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

const WishlisPage= async() => {
    const user = await currentUser();
  return (
    <>
    {user? <WishlistProducts/> : <NoAccess/>}
    </>
  )
}

export default WishlisPage