import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { layoutId: string } }
) {
  try {
    const layoutId = params.layoutId;

    const fields = await prisma.layout_fields.findMany({
      where: {
        layout_id: layoutId || '1',
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    const formattedFields = fields.map((field: any) => ({
      id: field.id,
      layout_id: field.layout_id,
      field_name: field.field_name,
      field_label: field.field_label,
      svg_id: field.svg_id,
      field_type: field.field_type as 'manual' | 'auto_calculated' | 'sink' | 'backsplash',
      data_type: field.data_type as 'measurement' | 'text' | 'number',
      unit_type: field.unit_type as 'feet' | 'inches' | 'both',
      is_required: field.is_required,
      is_visible: field.is_visible,
      sort_order: field.sort_order,
      validation_rules: field.validation_rules,
    }));

    return NextResponse.json(formattedFields);
  } catch (error) {
    console.error('Error fetching layout fields:', error);
    return NextResponse.json({ error: 'Failed to fetch layout fields' }, { status: 500 });
  }
} 