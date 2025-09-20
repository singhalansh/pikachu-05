import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin' || 
                   user.email?.includes('@admin.') ||
                   user.email?.includes('@city.gov');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get admin-specific statistics
    const [
      issuesManagedResult,
      issuesResolvedResult,
      usersManagedResult,
      departmentsResult,
      notificationsResult,
      reportsResult,
      adminActionsResult
    ] = await Promise.all([
      // Issues managed by this admin
      supabase
        .from('issues')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', user.id),
      
      // Issues resolved by this admin
      supabase
        .from('issues')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'resolved'),
      
      // Users managed (total users in system)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      
      // Departments managed
      supabase
        .from('departments')
        .select('id', { count: 'exact', head: true }),
      
      // Notifications sent by this admin
      supabase
        .from('admin_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id),
      
      // Reports generated (placeholder - you might have a reports table)
      supabase
        .from('issues')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Last 30 days
      
      // Admin actions (issues updated by this admin)
      supabase
        .from('issue_updates')
        .select('id', { count: 'exact', head: true })
        .eq('updated_by', user.id)
    ]);

    // Calculate success rate
    const issuesManaged = issuesManagedResult.count || 0;
    const issuesResolved = issuesResolvedResult.count || 0;
    const successRate = issuesManaged > 0 ? Math.round((issuesResolved / issuesManaged) * 100) : 0;

    // Get last login from user metadata
    const lastLogin = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown';

    const stats = {
      issues_managed: issuesManaged,
      issues_resolved: issuesResolved,
      users_managed: usersManagedResult.count || 0,
      departments_managed: departmentsResult.count || 0,
      notifications_sent: notificationsResult.count || 0,
      reports_generated: reportsResult.count || 0,
      system_uptime: "99.9%", // This could be calculated from system logs
      last_login: lastLogin,
      total_admin_actions: adminActionsResult.count || 0,
      success_rate: successRate
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error in GET /api/admin/profile/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
