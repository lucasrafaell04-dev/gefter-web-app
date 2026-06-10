import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const edgeStyles = await prisma.edge_styles.findMany({
      orderBy: { sort_order: 'asc' },
    });

    const formatted = edgeStyles.map((edge) => ({
      ...edge,
      price_per_linear_ft: parseFloat(edge.price_per_linear_ft.toString()),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching edge styles:', error);
    return NextResponse.json({ error: 'Failed to fetch edge styles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const edgeStyle = await prisma.edge_styles.create({
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

    return NextResponse.json(
      { ...edgeStyle, price_per_linear_ft: parseFloat(edgeStyle.price_per_linear_ft.toString()) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating edge style:', error);
    return NextResponse.json({ error: 'Failed to create edge style' }, { status: 500 });
  }
}
