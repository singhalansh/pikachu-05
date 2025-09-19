import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = params;

    // Count total votes
    const [{ count: votesCount }, { data: existing, error: voteErr }] = await Promise.all([
      supabase.from('issue_votes').select('*', { count: 'exact', head: true }).eq('issue_id', id),
      user ? supabase.from('issue_votes').select('id').eq('issue_id', id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null, error: null } as any)
    ]);

    const hasVoted = !!existing;
    return NextResponse.json({ hasVoted, votesCount: votesCount || 0 });
  } catch (error) {
    console.error('Error in GET /api/issues/[id]/vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('issue_votes')
      .select('id')
      .eq('issue_id', id)
      .eq('user_id', user.id)
      .single();

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Error checking existing vote:', voteCheckError);
      return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 });
    }

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this issue' }, { status: 400 });
    }

    // Check if issue exists
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('id')
      .eq('id', id)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const { data: vote, error } = await supabase
      .from('issue_votes')
      .insert({
        issue_id: id,
        user_id: user.id
      })
      .select(`
        *,
        profiles:user_id(full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating vote:', error);
      return NextResponse.json({ error: 'Failed to vote on issue' }, { status: 500 });
    }

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/issues/[id]/vote:', error);
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

    const { error } = await supabase
      .from('issue_votes')
      .delete()
      .eq('issue_id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing vote:', error);
      return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vote removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/issues/[id]/vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
