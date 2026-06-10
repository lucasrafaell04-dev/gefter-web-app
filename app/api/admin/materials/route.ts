import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const materials = await prisma.materials.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(materials);
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const material = await prisma.materials.create({
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

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
