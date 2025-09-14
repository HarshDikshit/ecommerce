import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { currentUser } from '@clerk/nextjs/server';

export async function POST() {
  await connectDB();
  const user = await currentUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existingUser = await User.findOne({ clerkId: user.id });

  if (!existingUser) {
    const newUser = new User({
      clerkId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatarUrl: user.imageUrl, // From Google/Clerk
      email: user.emailAddresses[0].emailAddress,
      // Defaults for other fields
    });
    await newUser.save();
    return NextResponse.json({ message: 'User created' });
  }

  return NextResponse.json({ message: 'User synced' });
}