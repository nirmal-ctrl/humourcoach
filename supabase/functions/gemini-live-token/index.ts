import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIVE_MODEL = 'gemini-3.8-live';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body: { providerApiKey?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const suppliedKey = body.providerApiKey?.trim();
  const signedIn = await hasValidUser(request.headers.get('Authorization'));
  const apiKey = suppliedKey || (signedIn ? Deno.env.get('GOOGLE_AI_API_KEY') : undefined);
  if (!apiKey) {
    return json({
      error: signedIn
        ? 'Gemini Live is not configured. Add a Google API key in AI settings.'
        : 'Add a Google API key in AI settings before starting voice onboarding.',
    }, 503);
  }

  const expireTime = new Date(Date.now() + 15 * 60_000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 60_000).toISOString();
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      uses: 1,
      expireTime,
      newSessionExpireTime,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.name !== 'string') {
    return json({ error: data.error?.message ?? 'Google could not create a live session token.' }, response.status || 502);
  }
  return json({ token: data.name, model: LIVE_MODEL, expiresAt: expireTime });
});

async function hasValidUser(authorization: string | null) {
  if (!authorization) return false;
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) return false;
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser();
  return !error && Boolean(data.user);
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
