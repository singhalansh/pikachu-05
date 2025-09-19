import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    let query = supabase.from('profiles').select('id, full_name, email').limit(20);
    if (q) {
      // simple ilike on name or email
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error searching profiles:', error);
      return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
    return NextResponse.json({ profiles: data || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
