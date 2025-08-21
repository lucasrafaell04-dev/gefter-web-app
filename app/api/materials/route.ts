import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const materials = await prisma.materials.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    const formattedMaterials = materials.map(material => ({
      id: material.id,
      supplier_id: material.supplier_id || '',
      name: material.name,
      brand: material.brand || 'Premium Brand',
      color: material.color || 'Classic',
      variation: material.variation || 'Standard',
      thickness: material.thickness,
      price_per_sqft: material.price_per_sqft,
      created_at: material.created_at?.toISOString(),
      image: material.image || '',
      desc_Curta: material.desc_Curta || 'Premium quality material with excellent durability and aesthetic appeal.',
      desc_Longa: material.desc_Longa || 'This premium material offers exceptional durability, stunning aesthetics, and easy maintenance. Perfect for modern kitchen designs.',
      product: material.product || 'Premium Material',
      Seamns: material.Seamns || 'Seamless',
      Variation: material.Variation || 'Standard',
      Surface: material.Surface || 'Smooth, non-porous surface',
      Finish: material.Finish || 'Premium finish',
      Care: material.Care || 'Easy maintenance with regular cleaning',
      Seal: material.Seal || 'Pre-sealed',
      Warranty: material.Warranty || '25-Year Warranty',
      Vendor: material.Vendor || 'Premium Vendor',
    }));

    return NextResponse.json(formattedMaterials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
} 