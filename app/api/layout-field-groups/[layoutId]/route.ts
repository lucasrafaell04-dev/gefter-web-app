import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { layoutId: string } }
) {
  try {
    const layoutId = params.layoutId;

    const groups = await prisma.layout_field_groups.findMany({
      where: {
        layout_id: layoutId,
        is_visible: true,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    const formattedGroups = groups.map(group => ({
      id: group.id,
      layout_id: group.layout_id,
      group_name: group.group_name,
      group_label: group.group_label,
      sort_order: group.sort_order,
      is_visible: group.is_visible,
    }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error('Error fetching layout field groups:', error);
    return NextResponse.json({ error: 'Failed to fetch layout field groups' }, { status: 500 });
  }
} 