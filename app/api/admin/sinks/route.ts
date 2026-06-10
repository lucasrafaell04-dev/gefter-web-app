import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const sinks = await prisma.sinks.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(sinks);
  } catch (error: any) {
    console.error('Error fetching sinks:', error);
    return NextResponse.json({ error: 'Failed to fetch sinks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const sink = await prisma.sinks.create({
      data: {
        name,
        price: body.price != null ? parseFloat(body.price) : null,
        environment: body.environment || 'kitchen',
        asset_url: body.asset_url || null,
      },
    });

    return NextResponse.json(sink, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sink:', error);
    return NextResponse.json({ error: 'Failed to create sink' }, { status: 500 });
  }
}
