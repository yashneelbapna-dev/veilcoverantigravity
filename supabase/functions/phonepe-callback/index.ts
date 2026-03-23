import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as base64Decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY") || "YzAxMzJjOGItZmYyMS00NmE3LTgwZDAtMzJhNjA2M2E4YTk5";
const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") || "1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// No CORS headers needed - this is a server-to-server webhook from PhonePe

async function verifyChecksum(responseBase64: string, receivedChecksum: string): Promise<boolean> {
  const data = responseBase64 + PHONEPE_SALT_KEY;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  const expectedChecksum = hashHex + "###" + PHONEPE_SALT_INDEX;
  return expectedChecksum === receivedChecksum;
}

const handler = async (req: Request): Promise<Response> => {
  // PhonePe callbacks are POST requests only - reject OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 405 });
  }

  try {
    // PhonePe sends callback as POST with form data or JSON
    let responseBase64: string | null = null;
    let xVerify: string | null = null;

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const body = await req.json();
      responseBase64 = body.response;
      xVerify = req.headers.get("X-VERIFY") || body["x-verify"];
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      responseBase64 = formData.get("response") as string;
      xVerify = req.headers.get("X-VERIFY");
    }

    if (!responseBase64) {
      console.error("No response data in callback");
      return new Response(
        JSON.stringify({ error: "Invalid callback data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify checksum - REQUIRED for security
    if (!xVerify) {
      console.error("Missing X-VERIFY checksum header in callback");
      return new Response(
        JSON.stringify({ error: "Missing checksum" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const isValid = await verifyChecksum(responseBase64, xVerify);
    if (!isValid) {
      console.error("Invalid checksum in callback");
      return new Response(
        JSON.stringify({ error: "Invalid checksum" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decode the response
    const decodedBytes = base64Decode(responseBase64);
    const decoder = new TextDecoder();
    const responseJson = decoder.decode(decodedBytes);
    const callbackData = JSON.parse(responseJson);

    console.log("PhonePe callback received:", JSON.stringify(callbackData));

    const transactionId = callbackData.data?.merchantTransactionId;
    const paymentSuccess = callbackData.success && callbackData.code === "PAYMENT_SUCCESS";
    const paymentState = callbackData.data?.state || "UNKNOWN";

    if (transactionId && paymentSuccess) {
      // Use service role to update order
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Find order by transaction pattern and update
      const { data: orders, error: findError } = await supabaseAdmin
        .from("orders")
        .select("id, order_number")
        .eq("transaction_id", transactionId)
        .limit(1);

      if (!findError && orders && orders.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "completed",
            order_status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orders[0].id);

        if (updateError) {
          console.error("Failed to update order:", updateError);
        } else {
          console.log("Order updated via callback:", orders[0].order_number);
        }
      }
    }

    // PhonePe expects a 200 OK response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Callback processed",
        transactionId,
        paymentSuccess,
        state: paymentState,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in phonepe-callback:", error);
    // Still return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ success: false, error: "Processing error" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
