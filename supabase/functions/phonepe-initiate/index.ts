import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID") || "M238RDYVGI2H3_2601202151";
const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") || "YzAxMzJjOGItZmYyMS00NmE3LTgwZDAtMzJhNjA2M2E4YTk5";
const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") || "1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// PhonePe Sandbox URL
const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

// Restrict CORS to production and development origins
const ALLOWED_ORIGINS = [
  "https://veilcover.lovable.app",
  "https://veilcoverantigravity.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  // Use exact matching instead of startsWith to prevent subdomain bypass
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin 
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Input validation schema with origin validation for redirectUrl
const paymentRequestSchema = z.object({
  amount: z.number().int().positive().max(100000000),
  orderId: z.string().min(1).max(50),
  customerPhone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  customerEmail: z.string().email().max(255).optional(),
  redirectUrl: z.string().url().max(500).refine(
    (url) => ALLOWED_ORIGINS.some((origin) => url.startsWith(origin)),
    { message: "Invalid redirect URL origin" }
  ),
});

async function generateChecksum(payload: string, endpoint: string): Promise<string> {
  const data = payload + endpoint + PHONEPE_SALT_KEY;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex + "###" + PHONEPE_SALT_INDEX;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = authData.claims.sub;

    // Parse and validate request
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parseResult = paymentRequestSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Validation failed:", parseResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid payment data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { amount, orderId, customerPhone, redirectUrl } = parseResult.data;

    // Generate unique transaction ID
    const transactionId = `VEIL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Prepare PhonePe payload
    const payloadData = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: userId.substring(0, 36),
      amount: amount,
      redirectUrl: `${redirectUrl}?txnId=${transactionId}&orderId=${orderId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${SUPABASE_URL}/functions/v1/phonepe-callback`,
      mobileNumber: customerPhone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = base64Encode(JSON.stringify(payloadData));
    const endpoint = "/pg/v1/pay";
    const checksum = await generateChecksum(payload, endpoint);

    console.log("Initiating PhonePe payment:", { 
      transactionId, 
      orderId, 
      amount, 
      userId,
      merchantId: PHONEPE_MERCHANT_ID,
      endpoint: `${PHONEPE_BASE_URL}${endpoint}`,
    });

    // Validate required secrets
    if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
      console.error("Missing PhonePe credentials");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Call PhonePe API
    let response: Response;
    let responseData: any;
    
    try {
      response = await fetch(`${PHONEPE_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
        body: JSON.stringify({ request: payload }),
      });

      responseData = await response.json();
      console.log("PhonePe response status:", response.status);
      console.log("PhonePe response body:", JSON.stringify(responseData));
    } catch (fetchError) {
      console.error("PhonePe API fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Could not connect to payment gateway" }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!response.ok || !responseData.success) {
      console.error("PhonePe API error:", {
        status: response.status,
        code: responseData?.code,
        message: responseData?.message,
        data: responseData?.data,
      });
      return new Response(
        JSON.stringify({ 
          error: "Payment initiation failed. Please try again or contact support."
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Return the redirect URL
    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        redirectUrl: responseData.data?.instrumentResponse?.redirectInfo?.url,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in phonepe-initiate:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

serve(handler);
