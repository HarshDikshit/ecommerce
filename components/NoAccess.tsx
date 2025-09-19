import React from 'react'
import { Card,CardFooter, CardTitle, CardHeader, CardContent } from './ui/card'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from './ui/button'

const NoAccess = ({details = "Log in to view cart items and checkout. Don't miss out on your favorite products!"} : {details?: string}) => {
  return (
    <div className='flex items-center justify-center py-12 md:py-32 bg-gray-100 p-4 '>
      <Card className='w-full max-w-md p-5'>
      <CardHeader className='flex items-center flex-col'>
        <CardTitle className='text-2xl font-bold text-center'>Welcome Back!
          </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-center font-medium text-black/70'>{details}</p>
      <SignInButton mode='modal'>
        <Button className='bg-black/90 w-full'>Sign In</Button>
      </SignInButton>
      </CardContent>
      <CardFooter className='flex flex-col space-y-2 '>
        <div className='text-sm text-muted-foreground text-center'>Don&rsquo;t have an account?</div>
        <SignUpButton mode='modal'>
          <Button className='w-full ' size={'lg'} variant={'outline'}>
            Create an Account
          </Button>
        </SignUpButton>
      </CardFooter>
      </Card>
    </div>
  )
}

export default NoAccess