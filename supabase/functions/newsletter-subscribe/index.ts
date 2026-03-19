import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Allowed origins for CORS - exact match only to prevent subdomain bypass
const ALLOWED_ORIGINS = [
  'https://veilcover.lovable.app',
  'https://id-preview--cd4d1662-9d5c-4f46-9ba5-abdece17be90.lovable.app',
];

// Get CORS headers with origin validation
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

const RATE_LIMIT_MAX = 5; // Max 5 attempts
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour window

// Basic email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

Deno.serve(async (req) => {
  // Get origin for CORS validation
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Create Supabase admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check rate limit using database function (persistent across restarts)
    const { data: isAllowed, error: rateLimitError } = await supabaseAdmin
      .rpc('check_newsletter_rate_limit', {
        check_ip: clientIp,
        max_attempts: RATE_LIMIT_MAX,
        window_minutes: RATE_LIMIT_WINDOW_MINUTES,
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError.message);
      // Fail closed - deny access if rate limit check fails
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAllowed) {
      console.log(`Rate limited: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: 'Too many subscription attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Newsletter subscription attempt for: ${email.substring(0, 3)}***`);

    // Use upsert to handle duplicates gracefully without revealing subscription status
    const { error } = await supabaseAdmin
      .from('newsletter_emails')
      .upsert(
        { email, is_active: true },
        { onConflict: 'email', ignoreDuplicates: true }
      );

    if (error) {
      console.error('Database error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Unable to process subscription. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Always return success (don't reveal if email already existed)
    console.log(`Newsletter subscription successful for: ${email.substring(0, 3)}***`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed to newsletter!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
