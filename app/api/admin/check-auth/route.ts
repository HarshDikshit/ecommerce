import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

export async function GET(req: Request) {
  await connectDB();
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    return NextResponse.json({ error: 'No cookies found' }, { status: 401 });
  }

  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Authorized' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error:` Invalid token ${error}` }, { status: 401 });
  }
}