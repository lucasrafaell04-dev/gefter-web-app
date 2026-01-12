import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_user_id')?.value;
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!userId || !sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const user = await prisma.public_users.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = params;

    // Get quotes for this lead with all related data
    const quotes = await prisma.quotes.findMany({
      where: {
        lead_id: leadId,
      },
      include: {
        quote_items: {
          include: {
            layouts: {
              select: {
                id: true,
                name: true,
                layout_image: true,
              },
            },
            materials: {
              select: {
                id: true,
                name: true,
                brand: true,
                price_per_sqft: true,
              },
            },
            edge_styles: {
              select: {
                id: true,
                name: true,
                price_per_linear_ft: true,
              },
            },
          },
        },
        layouts: {
          select: {
            id: true,
            name: true,
            layout_image: true,
          },
        },
        materials: {
          select: {
            id: true,
            name: true,
            brand: true,
            price_per_sqft: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({ quotes });
  } catch (error: any) {
    console.error('Error loading lead quotes:', error);
    return NextResponse.json(
      { error: 'Failed to load quotes', details: error.message },
      { status: 500 }
    );
  }
}

