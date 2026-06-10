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
    const { name, brand, color, variation, thickness, price_per_sqft } = body;

    if (!name || !brand || !color || thickness == null || price_per_sqft == null) {
      return NextResponse.json(
        { error: 'name, brand, color, thickness, and price_per_sqft are required' },
        { status: 400 }
      );
    }

    const material = await prisma.materials.update({
      where: { id: params.id },
      data: {
        name,
        brand,
        color,
        variation: variation || 'Standard',
        thickness: parseFloat(thickness),
        price_per_sqft: parseFloat(price_per_sqft),
        supplier_id: body.supplier_id || null,
        image: body.image || null,
        desc_Curta: body.desc_Curta || null,
        desc_Longa: body.desc_Longa || null,
        product: body.product || null,
        Surface: body.Surface || null,
        Finish: body.Finish || null,
        Care: body.Care || null,
        Seal: body.Seal || null,
        Warranty: body.Warranty || null,
        Vendor: body.Vendor || null,
      },
    });

    return NextResponse.json(material);
  } catch (error: any) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const [quoteCount, quoteItemCount] = await Promise.all([
      prisma.quotes.count({ where: { material_id: params.id } }),
      prisma.quote_items.count({ where: { material_id: params.id } }),
    ]);

    if (quoteCount > 0 || quoteItemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete material that is used in existing quotes' },
        { status: 409 }
      );
    }

    await prisma.materials.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
