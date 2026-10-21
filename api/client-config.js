// Public Supabase client configuration for login on any device.
// Only a publishable/anon key may be returned. NEVER expose service role / secret keys.
module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  const url=String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/,'');
  const key=String(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !/^(sb_publishable_|eyJ)/.test(key) || /sb_secret_|service.role|service_role/i.test(key)) {
    return res.status(503).json({error:'Public Supabase config is missing or invalid'});
  }
  return res.status(200).json({url,key});
};
