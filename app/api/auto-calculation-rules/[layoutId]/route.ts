import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { layoutId: string } }
) {
  try {
    const layoutId = params.layoutId;

    const rules = await prisma.auto_calculation_rules.findMany({
      where: {
        layout_id: layoutId,
        is_active: true,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    const formattedRules = rules.map(rule => ({
      id: rule.id,
      layout_id: rule.layout_id,
      target_field_name: rule.target_field_name,
      formula: rule.formula,
      description: rule.description,
      is_active: rule.is_active,
      sort_order: rule.sort_order,
    }));

    return NextResponse.json(formattedRules);
  } catch (error) {
    console.error('Error fetching auto-calculation rules:', error);
    return NextResponse.json({ error: 'Failed to fetch auto-calculation rules' }, { status: 500 });
  }
} 