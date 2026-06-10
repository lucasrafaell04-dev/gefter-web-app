import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const layouts = await prisma.layouts.findMany({
      orderBy: { sort_order: 'asc' },
    });
    return NextResponse.json(layouts);
  } catch (error: any) {
    console.error('Error fetching layouts:', error);
    return NextResponse.json({ error: 'Failed to fetch layouts' }, { status: 500 });
  }
}
