import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const environmentParam = searchParams.get('environment');
  const environment = environmentParam ? environmentParam.toUpperCase() : null;

  try {
    const sinks = await prisma.sinks.findMany({
      where: environment ? { environment } : undefined,
      orderBy: {
        name: 'asc',
      },
    });

    const formattedSinks = sinks.map((sink) => ({
      id: sink.id,
      name: sink.name || 'Sink',
      description: '',
      assetUrl: sink.asset_url || '',
      price: sink.price ? Number(sink.price) : 0,
      environment: (sink.environment || 'kitchen') as 'kitchen' | 'bathroom',
      included: Number(sink.price || 0) === 0,
    }));

    return NextResponse.json(formattedSinks);
  } catch (error) {
    console.error('Error fetching sinks:', error);
    return NextResponse.json({ error: 'Failed to fetch sinks' }, { status: 500 });
  }
}

