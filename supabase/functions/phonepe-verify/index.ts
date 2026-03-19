import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID")!;
const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY")!;
const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") || "1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// PhonePe Sandbox URL
const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

// Restrict CORS to production and development origins
const ALLOWED_ORIGINS = [
  "https://veilcover.lovable.app",
  "https://id-preview--cd4d1662-9d5c-4f46-9ba5-abdece17be90.lovable.app",
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

const verifyRequestSchema = z.object({
  transactionId: z.string().min(1).max(100),
  orderId: z.string().min(1).max(50),
});

async function generateChecksum(endpoint: string): Promise<string> {
  const data = endpoint + PHONEPE_SALT_KEY;
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

    const parseResult = verifyRequestSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Validation failed:", parseResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid verification data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { transactionId, orderId } = parseResult.data;

    // Check payment status with PhonePe
    const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`;
    const checksum = await generateChecksum(endpoint);

    console.log("Verifying PhonePe payment:", { transactionId, orderId, userId });

    const response = await fetch(`${PHONEPE_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
      },
    });

    const responseData = await response.json();
    console.log("PhonePe status response:", JSON.stringify(responseData));

    if (!response.ok) {
      console.error("PhonePe status check failed:", responseData);
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paymentSuccess = responseData.success && responseData.code === "PAYMENT_SUCCESS";
    const paymentState = responseData.data?.state || "UNKNOWN";

    if (paymentSuccess) {
      // Use service role to update order status
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Update order with payment details
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "completed",
          order_status: "confirmed",
          transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", orderId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update order:", updateError);
      } else {
        console.log("Order updated successfully:", orderId);
      }
    }

    // Return sanitized response
    return new Response(
      JSON.stringify({
        success: paymentSuccess,
        transactionId,
        orderId,
        message: paymentSuccess ? "Payment successful" : "Payment not completed",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in phonepe-verify:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

serve(handler);
