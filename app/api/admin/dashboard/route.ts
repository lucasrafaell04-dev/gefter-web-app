import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // Get dashboard statistics
    const [totalLeads, totalQuotes, quotes, recentLeads] = await Promise.all([
      prisma.leads.count(),
      prisma.quotes.count(),
      prisma.quotes.findMany({
        select: {
          total_price: true,
        },
      }),
      prisma.leads.findMany({
        take: 10,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          zipCode: true,
          created_at: true,
        },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = quotes.reduce((sum, quote) => sum + (quote.total_price || 0), 0);

    return NextResponse.json({
      totalLeads,
      totalQuotes,
      totalRevenue,
      recentLeads,
    });
  } catch (error: any) {
    console.error('Error loading dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

