import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SMTP_USER = Deno.env.get("SMTP_USER")!;
const SMTP_PASS = Deno.env.get("SMTP_PASS")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Product IDs from collections.ts that have no product detail page
const ORPHAN_PRODUCT_IDS = [
  "na-1", "na-2", "na-3",
  "bs-1", "bs-2", "bs-3",
  "ms-1", "ms-2", "ms-3",
  "pl-1", "pl-2", "pl-3",
];

const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const generateCancellationEmail = (orderNumber: string, customerName: string, productName: string, total: number) => {
  const formattedTotal = `₹${(total).toLocaleString("en-IN")}`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">
  <div style="text-align:center;margin-bottom:32px">
    <h1 style="font-size:28px;letter-spacing:8px;color:#1a1a1a;margin:0">V E I L</h1>
  </div>
  <div style="background:#1a1a1a;border-radius:12px;padding:40px 32px;color:#ffffff">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:48px">❌</span>
    </div>
    <h2 style="text-align:center;font-size:22px;color:#C9A96E;margin:0 0 8px">Order Cancelled</h2>
    <p style="text-align:center;color:#999;font-size:14px;margin:0 0 24px">
      Order #${escapeHtml(orderNumber)}
    </p>
    <div style="background:#2a2a2a;border-radius:8px;padding:20px;margin-bottom:24px">
      <p style="color:#ffffff;font-size:14px;line-height:1.6;margin:0">
        Hi ${escapeHtml(customerName)},
      </p>
      <p style="color:#cccccc;font-size:14px;line-height:1.6;margin:12px 0 0">
        We're sorry to inform you that your order containing <strong style="color:#C9A96E">${escapeHtml(productName)}</strong> has been cancelled because this product has been discontinued from our catalog.
      </p>
      <p style="color:#cccccc;font-size:14px;line-height:1.6;margin:12px 0 0">
        If any payment was made, a full refund of <strong style="color:#C9A96E">${formattedTotal}</strong> will be processed within 5-7 business days.
      </p>
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="https://veilcover.lovable.app/shop" style="display:inline-block;background:#C9A96E;color:#1a1a1a;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        Browse New Collection
      </a>
    </div>
    <p style="text-align:center;color:#666;font-size:12px;margin-top:24px">
      We apologize for the inconvenience. Please explore our updated collection for the latest premium cases.
    </p>
  </div>
  <p style="text-align:center;color:#999;font-size:11px;margin-top:24px">
    © 2026 VEIL. All rights reserved.
  </p>
</div>
</body>
</html>`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify the caller is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find all non-cancelled, non-delivered orders with orphan product IDs
    const { data: allOrders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, order_status, total, user_id, items")
      .not("order_status", "in", '("cancelled","delivered")');

    if (ordersError) throw ordersError;

    // Filter orders that contain orphan products
    const orphanOrders = (allOrders || []).filter((order: any) => {
      const items = order.items as any[];
      return items.some((item: any) => ORPHAN_PRODUCT_IDS.includes(item.productId));
    });

    if (orphanOrders.length === 0) {
      return new Response(JSON.stringify({ message: "No orphan orders found", cancelled: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profiles for all affected users
    const userIds = [...new Set(orphanOrders.map((o: any) => o.user_id))];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Setup email transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const results: { orderNumber: string; status: string; email?: string }[] = [];

    for (const order of orphanOrders) {
      try {
        // Cancel the order
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({ order_status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", order.id);

        if (updateError) {
          results.push({ orderNumber: order.order_number, status: "update_failed" });
          continue;
        }

        // Get user profile
        const profile = profileMap.get(order.user_id);
        if (!profile?.email) {
          results.push({ orderNumber: order.order_number, status: "cancelled_no_email" });
          continue;
        }

        // Get product name from first item
        const items = order.items as any[];
        const productName = items[0]?.name || "Discontinued Product";

        // Send cancellation email
        const html = generateCancellationEmail(
          order.order_number,
          profile.full_name || "Customer",
          productName,
          order.total
        );

        await transporter.sendMail({
          from: `"VEIL" <${SMTP_USER}>`,
          to: profile.email,
          subject: `Order Cancelled — ${order.order_number}`,
          html,
        });

        results.push({ orderNumber: order.order_number, status: "cancelled_emailed", email: profile.email });
      } catch (err) {
        results.push({ orderNumber: order.order_number, status: `error: ${err.message}` });
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${orphanOrders.length} orphan orders`,
      cancelled: results.filter(r => r.status.startsWith("cancelled")).length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
