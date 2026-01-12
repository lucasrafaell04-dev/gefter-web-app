import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear admin session cookies
    cookieStore.delete('admin_session');
    cookieStore.delete('admin_user_id');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

