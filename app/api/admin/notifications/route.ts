import { NextRequest, NextResponse } from 'next/server';

// Global in-memory storage for admin notifications
let adminNotifications: any[] = [];

export async function GET(request: NextRequest) {
  console.log(`[ADMIN-NOTIFICATIONS] GET: Returning ${adminNotifications.length} notifications`);
  
  const sortedNotifications = adminNotifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({
    notifications: sortedNotifications,
    unreadCount: adminNotifications.filter(n => !n.read).length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, priority = 'medium', data } = body;

    console.log(`[ADMIN-NOTIFICATIONS] POST: Creating notification:`, { type, title, priority });

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

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

    // Keep only latest 100 notifications
    if (adminNotifications.length > 100) {
      adminNotifications = adminNotifications.slice(0, 100);
    }

    console.log(`[ADMIN-NOTIFICATIONS] SUCCESS: Created notification ${notification.id}`);
    console.log(`[ADMIN-NOTIFICATIONS] Total notifications: ${adminNotifications.length}`);

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('[ADMIN-NOTIFICATIONS] ERROR creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    console.log(`[ADMIN-NOTIFICATIONS] PATCH: Action: ${action} for ID: ${id || 'all'}`);

    let updated = false;

    if (action === 'mark_read' && id) {
      adminNotifications = adminNotifications.map(notification => {
        if (notification.id === id) {
          updated = true;
          return { ...notification, read: true };
        }
        return notification;
      });
    } else if (action === 'mark_all_read') {
      adminNotifications = adminNotifications.map(notification => ({
        ...notification,
        read: true
      }));
      updated = true;
    } else if (action === 'dismiss' && id) {
      const originalLength = adminNotifications.length;
      adminNotifications = adminNotifications.filter(notification => notification.id !== id);
      updated = adminNotifications.length < originalLength;
    }

    console.log(`[ADMIN-NOTIFICATIONS] PATCH: Updated = ${updated}, Unread count = ${adminNotifications.filter(n => !n.read).length}`);

    return NextResponse.json({
      success: true,
      updated,
      unreadCount: adminNotifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('[ADMIN-NOTIFICATIONS] PATCH ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}