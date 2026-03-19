import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGINS = [
  "https://veilcover.lovable.app",
  "https://id-preview--cd4d1662-9d5c-4f46-9ba5-abdece17be90.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const statusMessages: Record<string, { label: string; message: string; emoji: string }> = {
  ordered: { label: "Order Placed", message: "Your order has been placed successfully.", emoji: "🛒" },
  confirmed: { label: "Order Confirmed", message: "Your order has been confirmed.", emoji: "✅" },
  packed: { label: "Order Packed", message: "Your order has been packed and prepared for shipment.", emoji: "📦" },
  shipped: { label: "Order Shipped", message: "Your order has been shipped and is on its way!", emoji: "🚚" },
  out_for_delivery: { label: "Out for Delivery", message: "Your order is out for delivery and will arrive soon!", emoji: "📬" },
  delivered: { label: "Order Delivered", message: "Your order has been delivered. Enjoy your purchase!", emoji: "🎉" },
  cancelled: { label: "Order Cancelled", message: "Your order has been cancelled. A refund will be processed if applicable.", emoji: "❌" },
};

const generateEmailHtml = (order: {
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}): string => {
  const info = statusMessages[order.status] || {
    label: "Order Update",
    message: `Your order status has been updated to: ${order.status}`,
    emoji: "📋",
  };

  const trackingSection = order.tracking_number ? `
    <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 15px; color: #0A0A0A;">📍 Tracking Information</h3>
      <p style="margin: 0; color: #333;">
        <strong>Tracking Number:</strong> ${escapeHtml(order.tracking_number)}<br>
        ${order.carrier ? `<strong>Carrier:</strong> ${escapeHtml(order.carrier.toUpperCase())}<br>` : ""}
        ${order.estimated_delivery ? `<strong>Estimated Delivery:</strong> ${escapeHtml(order.estimated_delivery)}` : ""}
      </p>
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${info.label} - VeilCover</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%); padding: 40px; text-align: center;">
      <h1 style="color: #D4AF37; margin: 0; font-size: 32px; letter-spacing: 4px;">VEILCOVER</h1>
      <p style="color: #888; margin: 10px 0 0; font-size: 14px;">Premium Phone Protection</p>
    </div>
    <div style="padding: 40px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 20px;">${info.emoji}</div>
      <h2 style="color: #0A0A0A; margin: 0 0 15px;">${info.label}</h2>
      <p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
        Hello ${escapeHtml(order.customer_name)},<br><br>
        ${info.message}
      </p>
      <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
        <p style="margin: 5px 0 0; color: #D4AF37; font-size: 20px; font-weight: bold;">${escapeHtml(order.order_number)}</p>
        <p style="margin: 10px 0 0; color: #333; font-size: 16px;">Total: ₹${order.total}</p>
      </div>
      ${trackingSection}
      <div style="margin: 30px 0;">
        <a href="https://veilcover.lovable.app/account" style="display: inline-block; background-color: #0A0A0A; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Order Details
        </a>
      </div>
    </div>
    <div style="background-color: #0A0A0A; padding: 30px; text-align: center;">
      <p style="color: #D4AF37; margin: 0 0 10px; font-size: 18px; letter-spacing: 2px;">VEILCOVER</p>
      <p style="color: #666; margin: 0; font-size: 12px;">Premium Phone Protection</p>
      <p style="color: #888; margin: 15px 0 0; font-size: 11px;">Thank you for shopping with VeilCover.</p>
    </div>
  </div>
</body>
</html>`;
};

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

    // Verify admin role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate request body
    const { order } = await req.json();

    if (!order?.email) {
      return new Response(
        JSON.stringify({ error: "Missing order email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(order.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!order.order_number || !order.customer_name || !order.status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: order_number, customer_name, status" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Read SMTP credentials from environment
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");

    if (!smtpUser || !smtpPass) {
      console.error("SMTP credentials not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailHtml = generateEmailHtml({
      order_number: order.order_number,
      customer_name: order.customer_name,
      status: order.status,
      total: order.total || 0,
      tracking_number: order.tracking_number,
      carrier: order.carrier,
      estimated_delivery: order.estimated_delivery,
    });

    const info = statusMessages[order.status] || { label: "Order Update" };

    console.log("Sending order email via Gmail SMTP to:", order.email);

    await transporter.sendMail({
      from: `"VeilCover" <${smtpUser}>`,
      to: order.email,
      subject: `Order ${escapeHtml(order.order_number)} - ${info.label}`,
      html: emailHtml,
    });

    console.log("Email sent successfully to:", order.email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-order-email:", error);
    return new Response(
      JSON.stringify({ error: "Unable to send email. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

serve(handler);
