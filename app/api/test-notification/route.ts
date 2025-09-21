// app/api/test-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing admin notification creation...');
    
    // Send a test notification to the admin notifications endpoint
    const testNotification = {
      type: "new_issue",
      title: "TEST: New Issue Reported - Pothole Test",
      message: "A test issue has been reported to verify the notification system is working correctly.",
      priority: "medium",
      data: {
        issueId: `TEST-${Date.now()}`,
        category: "Road Maintenance",
        location: "Test Street, Test District",
        reportedBy: "test@example.com",
        reportedAt: new Date().toISOString()
      }
    };

    const response = await fetch(`${request.nextUrl.origin}/api/admin/notifications`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": request.headers.get("Authorization") || "",
        "Cookie": request.headers.get("Cookie") || ""
      },
      body: JSON.stringify(testNotification),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test notification sent successfully:', result);
      return NextResponse.json({
        success: true,
        message: "Test notification sent successfully!",
        notification: result.notification
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Test notification failed:', errorText);
      return NextResponse.json({
        success: false,
        error: `Failed to send test notification: ${errorText}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test notification error:', error);
    return NextResponse.json({
      success: false,
      error: `Test notification failed: ${error}`
    }, { status: 500 });
  }
}