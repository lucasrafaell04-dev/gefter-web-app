import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('admin_user_id')?.value;
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!userId || !sessionToken) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await prisma.public_users.findUnique({
    where: { id: userId },
    select: { id: true, email: true, full_name: true, role: true },
  });

  if (!user || user.role !== 'admin') {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { authorized: true as const, user };
}
