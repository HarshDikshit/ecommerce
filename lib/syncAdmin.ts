import bcrypt from 'bcryptjs';
import connectDB from './db';
import Admin from '@/models/Admin';

export const syncAdmin = async () => {
  await connectDB();
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) throw new Error('Admin credentials not set in .env');

  const existingAdmin = await Admin.findOne({ username });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({
      username,
      password: hashedPassword,
      name: 'Admin',
      email: 'admin@divinegems.com',
      role: 'admin',
    });
    console.log('Admin user created');
  }
};