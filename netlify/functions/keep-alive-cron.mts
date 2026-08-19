// Netlify Scheduled Function - triggers app/api/cron/keep-alive once a day.
// Kept separate from the Next.js app (which @netlify/plugin-nextjs deploys on
// its own) because Netlify's schedule trigger is a Netlify Functions concept;
// this function's only job is to call the real (portable, platform-agnostic)
// ping route over HTTP, so the actual "what does the ping do" logic lives in
// exactly one place.

export default async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!siteUrl) {
    console.error('keep-alive-cron: no site URL available in the function environment');
    return new Response('Missing site URL', { status: 500 });
  }

  const headers: Record<string, string> = {};
  if (process.env.CRON_SECRET) {
    headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
  }

  try {
    const res = await fetch(`${siteUrl}/api/cron/keep-alive`, { headers });
    const body = await res.text();
    console.log(`keep-alive-cron: ${res.status} ${body}`);
    return new Response(body, { status: res.status });
  } catch (error) {
    console.error('keep-alive-cron: request failed', error);
    return new Response('Request failed', { status: 500 });
  }
};

export const config = {
  schedule: '0 4 * * *',
};
