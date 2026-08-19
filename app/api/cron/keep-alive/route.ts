
import { createClient } from '@supabase/supabase-js';

// Purely to generate daily Supabase API activity so the free-tier project
// doesn't get auto-paused after a period of inactivity. Deliberately the
// cheapest possible read (head:true returns only a count, no row data) and
// works whether or not a caller is authenticated - RLS will filter rows to
// zero for anonymous callers, but the request itself still counts as
// activity from Supabase's side regardless of what it returns.
//
// Triggered by:
// - Vercel Cron (see vercel.json) - Vercel automatically sends
//   `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is set.
// - Netlify Scheduled Functions (see netlify/functions/keep-alive-cron.mts),
//   which fetches this route and attaches the same header itself.
export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('novel_projects')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;

    return Response.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Keep-alive cron failed:', error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
