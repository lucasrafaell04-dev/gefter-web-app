import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const sink = await prisma.sinks.update({
      where: { id: params.id },
      data: {
        name,
        price: body.price != null ? parseFloat(body.price) : null,
        environment: body.environment || 'kitchen',
        asset_url: body.asset_url || null,
      },
    });

    return NextResponse.json(sink);
  } catch (error: any) {
    console.error('Error updating sink:', error);
    return NextResponse.json({ error: 'Failed to update sink' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await prisma.sinks.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting sink:', error);
    return NextResponse.json({ error: 'Failed to delete sink' }, { status: 500 });
  }
}
