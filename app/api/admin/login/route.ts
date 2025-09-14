import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(req: Request) {
  await connectDB();
  const { username, password } = await req.json();

  const user = await User.findOne({ username, role: 'admin' });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  return NextResponse.json({ message: 'Login successful' }, {
    headers: {
      'Set-Cookie': serialize('token', token, { path: '/', httpOnly: true, maxAge: 3600 }),
    },
  });
}