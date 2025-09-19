import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    const { data: issue, error } = await supabase
      .from('issues')
      .select(`
        *,
        profiles:user_id(full_name, email),
        assigned_profile:assigned_to(full_name, email),
        comments:comments(
          *,
          profiles:user_id(full_name, email)
        ),
        issue_votes:issue_votes(
          *,
          profiles:user_id(full_name, email)
        ),
        issue_updates:issue_updates(
          *,
          profiles:user_id(full_name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching issue:', error);
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error in GET /api/issues/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, description, category, priority, status, location_address, location_lat, location_lng, image_url, assigned_to } = body;

    // Check if user can update this issue (owner or admin)
    const { data: existingIssue, error: fetchError } = await supabase
      .from('issues')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const isAdmin = user.user_metadata?.role === 'admin';
    const isOwner = existingIssue.user_id === user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (location_address !== undefined) updateData.location_address = location_address;
    if (location_lat !== undefined) updateData.location_lat = location_lat ? parseFloat(location_lat) : null;
    if (location_lng !== undefined) updateData.location_lng = location_lng ? parseFloat(location_lng) : null;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (assigned_to !== undefined && isAdmin) updateData.assigned_to = assigned_to;

    const { data: issue, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        profiles:user_id(full_name, email),
        assigned_profile:assigned_to(full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating issue:', error);
      return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error in PUT /api/issues/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user can delete this issue (owner or admin)
    const { data: existingIssue, error: fetchError } = await supabase
      .from('issues')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const isAdmin = user.user_metadata?.role === 'admin';
    const isOwner = existingIssue.user_id === user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting issue:', error);
      return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/issues/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
