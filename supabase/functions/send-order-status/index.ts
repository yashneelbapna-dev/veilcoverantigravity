import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

interface StatusEmailRequest {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const getStatusMessage = (status: string): { title: string; message: string; emoji: string } => {
  switch (status) {
    case "confirmed":
      return {
        title: "Order Confirmed!",
        message: "Your order has been confirmed and is being prepared.",
        emoji: "✅",
      };
    case "processing":
      return {
        title: "Order Processing",
        message: "We're preparing your order for shipment.",
        emoji: "📦",
      };
    case "shipped":
      return {
        title: "Order Shipped!",
        message: "Great news! Your order is on its way.",
        emoji: "🚚",
      };
    case "out_for_delivery":
      return {
        title: "Out for Delivery",
        message: "Your order is out for delivery and will arrive soon!",
        emoji: "📬",
      };
    case "delivered":
      return {
        title: "Order Delivered!",
        message: "Your order has been delivered. Enjoy your purchase!",
        emoji: "🎉",
      };
    case "cancelled":
      return {
        title: "Order Cancelled",
        message: "Your order has been cancelled. A refund will be processed if applicable.",
        emoji: "❌",
      };
    default:
      return {
        title: "Order Update",
        message: `Your order status has been updated to: ${status}`,
        emoji: "📋",
      };
  }
};

const generateStatusEmailHtml = (data: StatusEmailRequest): string => {
  const { title, message, emoji } = getStatusMessage(data.newStatus);
  
  const trackingSection = data.trackingNumber ? `
    <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px; color: #0A0A0A;">📍 Tracking Information</h3>
      <p style="margin: 0; color: #333;">
        <strong>Tracking Number:</strong> ${escapeHtml(data.trackingNumber)}<br>
        ${data.carrier ? `<strong>Carrier:</strong> ${escapeHtml(data.carrier.toUpperCase())}<br>` : ""}
        ${data.estimatedDelivery ? `<strong>Estimated Delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}` : ""}
      </p>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - VEIL</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%); padding: 40px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 32px; letter-spacing: 4px;">VEIL</h1>
          <p style="color: #888; margin: 10px 0 0; font-size: 14px;">Premium Phone Protection</p>
        </div>
        
        <!-- Status Update -->
        <div style="padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">${emoji}</div>
          <h2 style="color: #0A0A0A; margin: 0 0 15px;">${title}</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
            Hi ${escapeHtml(data.customerName)},<br><br>
            ${message}
          </p>
          
          <!-- Order Number -->
          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block;">
            <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
            <p style="margin: 5px 0 0; color: #D4AF37; font-size: 20px; font-weight: bold;">${escapeHtml(data.orderNumber)}</p>
          </div>
          
          ${trackingSection}
          
          <!-- CTA Button -->
          <div style="margin: 30px 0;">
            <a href="https://veilcover.lovable.app/account" style="display: inline-block; background-color: #0A0A0A; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Order Details
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0A0A0A; padding: 30px; text-align: center;">
          <p style="color: #D4AF37; margin: 0 0 10px; font-size: 18px; letter-spacing: 2px;">VEIL</p>
          <p style="color: #666; margin: 0; font-size: 12px;">Premium Phone Protection • Artist Village, Maharashtra</p>
          <p style="color: #888; margin: 15px 0 0; font-size: 11px;">
            Questions? Reply to this email or contact us at support@veil.shop
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - require Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use anon client for JWT claim validation
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate JWT using getClaims (consistent with admin-list-storage pattern)
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = authData.claims.sub;

    // Verify admin role server-side using service role client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Admin check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data: StatusEmailRequest = await req.json();
    
    // Validate required fields
    if (!data.customerEmail || !data.customerName || !data.orderNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: customerEmail, customerName, or orderNumber" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Strict email validation - prevent sending to user_ids or invalid addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      console.error("Invalid email address provided:", data.customerEmail);
      return new Response(
        JSON.stringify({ error: "Invalid customer email address. Please update the order with a valid email." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log("Sending status update email for:", data.orderNumber, "to:", data.customerEmail);

    const emailHtml = generateStatusEmailHtml(data);
    const { title } = getStatusMessage(data.newStatus);

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VEIL <orders@resend.dev>",
        to: [data.customerEmail],
        subject: `${title} - ${data.orderNumber} | VEIL`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent:", emailResult);

    // Also send to admin (use environment variable instead of hardcoded email)
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    if (ADMIN_EMAIL) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "VEIL Orders <orders@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `[STATUS UPDATE] ${data.orderNumber} → ${data.newStatus.toUpperCase()}`,
          html: emailHtml,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    // Log detailed error server-side only
    console.error("Error in send-order-status:", error);
    // Return generic message to client (no internal details)
    return new Response(
      JSON.stringify({ error: "Unable to send status update. Please try again or contact support." }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

serve(handler);
