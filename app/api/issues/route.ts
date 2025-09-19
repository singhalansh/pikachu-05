import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // If id is provided, return a single issue with relations
    if (id) {
      const { data: issue, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles:user_id(full_name, email),
          assigned_profile:assigned_to(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching issue by id:', error);
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }

      // Optionally, fetch counts for comments and votes
      const [commentsAgg, votesAgg, timelineRes] = await Promise.all([
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('issue_id', id),
        supabase.from('issue_votes').select('*', { count: 'exact', head: true }).eq('issue_id', id),
        supabase
          .from('issue_updates')
          .select(`*, profiles:user_id(full_name, email)`) // who made the update
          .eq('issue_id', id)
          .order('created_at', { ascending: true })
      ]);

      const commentsCount = (commentsAgg as any).count || 0;
      const votesCount = (votesAgg as any).count || 0;
      const timeline = (timelineRes as any).data || [];

      return NextResponse.json({ issue, meta: { commentsCount, votesCount, timeline } });
    }
    
    let query = supabase
      .from('issues')
      .select(`
        *,
        profiles:user_id(full_name, email),
        assigned_profile:assigned_to(full_name, email),
        comments:comments(count),
        issue_votes:issue_votes(count)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location_address.ilike.%${search}%`);
    }

    const { data: issues, error } = await query;
    
    if (error) {
      console.error('Error fetching issues:', error);
      return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase.from('issues').select('*', { count: 'exact', head: true });
    if (category && category !== 'all') countQuery = countQuery.eq('category', category);
    if (status && status !== 'all') countQuery = countQuery.eq('status', status);
    if (search) countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,location_address.ilike.%${search}%`);
    
    const { count } = await countQuery;

    // Merge explicit counts (robust across FK metadata) into top-level fields
    const issueList = issues || [];
    const ids = issueList.map((i: any) => i.id);
    if (ids.length > 0) {
      const [commentsAgg, votesAgg] = await Promise.all([
        supabase.from('comments').select('issue_id, count:issue_id', { count: 'exact' }).in('issue_id', ids),
        supabase.from('issue_votes').select('issue_id, count:issue_id', { count: 'exact' }).in('issue_id', ids)
      ]);

      const commentsCountMap = new Map<string, number>();
      if ((commentsAgg as any).data) {
        for (const row of (commentsAgg as any).data) {
          // row has issue_id; count returned separately via header; for reliability compute manually below if needed
          // We'll fall back to filtering length if needed
        }
      }

      // Fallback simple counts per issue using separate queries per id to guarantee correctness
      // (kept small as we page results)
      await Promise.all(issueList.map(async (it: any) => {
        const [{ count: cCount }, { count: vCount }] = await Promise.all([
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('issue_id', it.id),
          supabase.from('issue_votes').select('*', { count: 'exact', head: true }).eq('issue_id', it.id)
        ]);
        it.comments_count = cCount || 0;
        it.votes_count = vCount || 0;
      }));
    }

    return NextResponse.json({
      issues: issueList,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/issues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, priority, location_address, location_lat, location_lng, landmark, image_url } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Title, description, and category are required' }, { status: 400 });
    }

    // Enforce location required: address and coordinates must be present and valid
    const latNum = typeof location_lat === 'string' ? parseFloat(location_lat) : Number(location_lat);
    const lngNum = typeof location_lng === 'string' ? parseFloat(location_lng) : Number(location_lng);
    const addressStr = (location_address || '').toString().trim();
    if (!addressStr || !Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return NextResponse.json({ error: 'Location is required. Please use the map to set a valid location.' }, { status: 400 });
    }

    // Insert the issue and return with related profile info (requires FKs between issues.user_id and profiles.id)
    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        title,
        description,
        category,
        priority: priority || 'medium',
        location_address: addressStr,
        location_lat: latNum,
        location_lng: lngNum,
        landmark,
        image_url,
        user_id: user.id
      })
      .select(`
        *,
        profiles:user_id(full_name, email)
      `)
      .single();
    
    if (issue && !error) {
      return NextResponse.json({ issue }, { status: 201 });
    }

    if (error) {
      console.error('Error creating issue:', error);
      return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
    }

    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/issues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
