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
    const { name, price_per_linear_ft, thickness } = body;

    if (!name || price_per_linear_ft == null || !thickness) {
      return NextResponse.json(
        { error: 'name, price_per_linear_ft, and thickness are required' },
        { status: 400 }
      );
    }

    const edgeStyle = await prisma.edge_styles.update({
      where: { id: params.id },
      data: {
        name,
        thickness,
        price_per_linear_ft: parseFloat(price_per_linear_ft),
        description: body.description || null,
        image: body.image || null,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      },
    });

    return NextResponse.json({
      ...edgeStyle,
      price_per_linear_ft: parseFloat(edgeStyle.price_per_linear_ft.toString()),
    });
  } catch (error: any) {
    console.error('Error updating edge style:', error);
    return NextResponse.json({ error: 'Failed to update edge style' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const quoteItemCount = await prisma.quote_items.count({
      where: { edge_style_id: params.id },
    });

    if (quoteItemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete edge style that is used in existing quotes. Deactivate it instead.' },
        { status: 409 }
      );
    }

    await prisma.edge_styles.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting edge style:', error);
    return NextResponse.json({ error: 'Failed to delete edge style' }, { status: 500 });
  }
}
