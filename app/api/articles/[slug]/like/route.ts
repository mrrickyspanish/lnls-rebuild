import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { like } = body; // true to like, false to unlike

    if (typeof like !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: like must be a boolean' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAnonClient();

    // Call the database function to increment/decrement likes
    const delta = like ? 1 : -1;
    const { data, error } = await supabase.rpc('increment_article_likes', {
      article_slug: slug,
      delta: delta,
    });

    if (error) {
      console.error('Error updating likes:', error);
      return NextResponse.json(
        { error: 'Failed to update likes' },
        { status: 500 }
      );
    }

    // The function returns an array with the new count
    const newLikes = data?.[0]?.new_likes ?? 0;

    return NextResponse.json({
      success: true,
      likes: newLikes,
      action: like ? 'liked' : 'unliked',
    });
  } catch (error) {
    console.error('Error in like endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
