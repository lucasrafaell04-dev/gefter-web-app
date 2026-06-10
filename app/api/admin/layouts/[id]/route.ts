import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    if (typeof body.is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active (boolean) is required' }, { status: 400 });
    }

    const layout = await prisma.layouts.update({
      where: { id: params.id },
      data: { is_active: body.is_active },
    });

    return NextResponse.json(layout);
  } catch (error: any) {
    console.error('Error updating layout:', error);
    return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 });
  }
}
