import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET all updates for an issue (ordered oldest -> newest)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    const { data: updates, error } = await supabase
      .from('issue_updates')
      .select(`*, profiles:user_id(full_name, email)`) // author profile
      .eq('issue_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching updates:', error);
      return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
    }

    return NextResponse.json({ updates: updates || [] });
  } catch (error) {
    console.error('Error in GET /api/issues/[id]/updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new timeline update. Admins may optionally update issue status and assignment.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, comment, assign_to } = body as { status?: string; comment?: string; assign_to?: string };

    // Verify issue exists
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('id')
      .eq('id', id)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const userRole = user.user_metadata?.role || user.role || 'citizen';
    const isAdmin = userRole !== 'citizen';

    // Insert timeline update first
    const { data: update, error: insError } = await supabase
      .from('issue_updates')
      .insert({
        issue_id: id,
        user_id: user.id,
        status: status ?? null,
        comment: (comment || '').trim() || null,
      })
      .select(`*, profiles:user_id(full_name, email)`) // author profile
      .single();

    if (insError) {
      console.error('Error inserting update:', insError);
      return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
    }

    // If admin, optionally update issue status and assignment
    let updatedIssue: any = null;
    if (isAdmin && (status !== undefined || assign_to !== undefined)) {
      const patch: any = {};
      if (status !== undefined) patch.status = status;
      if (assign_to !== undefined) patch.assigned_to = assign_to || null;

      const { data: afterIssue, error: updErr } = await supabase
        .from('issues')
        .update(patch)
        .eq('id', id)
        .select(`*, profiles:user_id(full_name, email), assigned_profile:assigned_to(full_name, email)`) // include POC
        .single();

      if (updErr) {
        console.error('Error updating issue from update:', updErr);
        // Not fatal to the timeline insert; return the update but with warning
      } else {
        updatedIssue = afterIssue;
      }
    }

    return NextResponse.json({ update, issue: updatedIssue }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/issues/[id]/updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
