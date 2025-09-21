import { NextRequest, NextResponse } from 'next/server';

let adminNotifications: any[] = [];

export async function GET() {
  console.log(`[ADMIN-NOTIFICATIONS] GET: Returning ${adminNotifications.length} notifications`);
  
  return NextResponse.json({
    notifications: adminNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    unreadCount: adminNotifications.filter(n => !n.read).length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, priority = 'medium', data } = body;

    console.log(`[ADMIN-NOTIFICATIONS] POST: Creating notification`, { type, title, priority });

    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      priority,
      timestamp: new Date().toISOString(),
      read: false,
      data: data || {}
    };

    adminNotifications.unshift(notification);
    if (adminNotifications.length > 100) {
      adminNotifications = adminNotifications.slice(0, 100);
    }

    console.log(`[ADMIN-NOTIFICATIONS] SUCCESS: Created notification ${notification.id}`);
    return NextResponse.json({ success: true, notification });

  } catch (error) {
    console.error('[ADMIN-NOTIFICATIONS] ERROR:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === 'mark_read' && id) {
      adminNotifications = adminNotifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
    } else if (action === 'mark_all_read') {
      adminNotifications = adminNotifications.map(n => ({ ...n, read: true }));
    } else if (action === 'dismiss' && id) {
      adminNotifications = adminNotifications.filter(n => n.id !== id);
    }

    return NextResponse.json({
      success: true,
      unreadCount: adminNotifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('[ADMIN-NOTIFICATIONS] PATCH ERROR:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}