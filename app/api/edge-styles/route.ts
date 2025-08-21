import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const edgeStyles = await prisma.edge_styles.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    const formattedEdgeStyles = edgeStyles.map((edgeStyle: any) => ({
      id: edgeStyle.id,
      name: edgeStyle.name,
      description: edgeStyle.description || '',
      image: edgeStyle.image || '',
      price_per_linear_ft: parseFloat(edgeStyle.price_per_linear_ft.toString()),
      thickness: edgeStyle.thickness,
      is_active: edgeStyle.is_active,
    }));

    return NextResponse.json(formattedEdgeStyles);
  } catch (error) {
    console.error('Error fetching edge styles:', error);
    return NextResponse.json({ error: 'Failed to fetch edge styles' }, { status: 500 });
  }
} 