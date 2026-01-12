import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_user_id')?.value;
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!userId || !sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify user exists and is admin
    const user = await prisma.public_users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error: any) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

