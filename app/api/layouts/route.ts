import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const layouts = await prisma.layouts.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    const formattedLayouts = layouts.map(layout => ({
      id: layout.id,
      name: layout.name,
      description: layout.description || '',
      layout_image: layout.layout_image,
      layout_type: layout.layout_type,
      svg_template_name: layout.svg_template_name,
      is_active: layout.is_active,
      sort_order: layout.sort_order,
      supports_backsplash: layout.supports_backsplash,
      supports_sink: layout.supports_sink,
      supports_wall_toggle: layout.supports_wall_toggle,
    }));

    return NextResponse.json(formattedLayouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return NextResponse.json({ error: 'Failed to fetch layouts' }, { status: 500 });
  }
} 