import { AccessToken } from 'npm:livekit-server-sdk@2.19.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body: { providerApiKey?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const googleApiKey = body.providerApiKey?.trim();
  if (!googleApiKey || googleApiKey.length < 12) {
    return json({ error: 'Add a valid Google API key in AI settings before starting voice onboarding.' }, 400);
  }

  const keyCheck = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-live', {
    headers: { 'x-goog-api-key': googleApiKey },
  });
  if (!keyCheck.ok) {
    const result = await keyCheck.json().catch(() => ({}));
    return json({ error: result.error?.message ?? 'Google rejected this API key.' }, 401);
  }

  const serverUrl = Deno.env.get('LIVEKIT_URL');
  const apiKey = Deno.env.get('LIVEKIT_API_KEY');
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
  if (!serverUrl || !apiKey || !apiSecret) return json({ error: 'LiveKit is not configured on the server.' }, 503);

  const roomName = `onboarding-${crypto.randomUUID()}`;
  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity: `learner-${crypto.randomUUID()}`,
    name: 'Sponto learner',
    ttl: '10m',
    metadata: JSON.stringify({ googleApiKey }),
  });
  accessToken.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });

  return json({ serverUrl, token: await accessToken.toJwt(), roomName });
});

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
