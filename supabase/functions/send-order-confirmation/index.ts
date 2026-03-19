import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Zod validation schemas for input validation
const orderItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
  color: z.string().max(50).optional(),
  model: z.string().max(100).optional(),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(1).max(100),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode format"),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, "Invalid phone format"),
});

const orderEmailSchema = z.object({
  customerEmail: z.string().email().max(255),
  customerName: z.string().min(1).max(100),
  orderNumber: z.string().regex(/^VEIL-/, "Invalid order number format").max(50),
  items: z.array(orderItemSchema).min(1).max(100),
  subtotal: z.number().int().min(0),
  shipping: z.number().int().min(0),
  tax: z.number().int().min(0),
  total: z.number().int().positive(),
  shippingAddress: shippingAddressSchema,
});

type OrderEmailRequest = z.infer<typeof orderEmailSchema>;

interface ResendEmailResponse {
  data?: { id: string };
  error?: { message: string };
}

const sendEmail = async (options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<ResendEmailResponse> => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(options),
  });
  return response.json();
};

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

const formatPrice = (paise: number): string => {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
};

// HTML escaping for defense-in-depth against XSS in email content
const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const generateOrderEmailHtml = (order: OrderEmailRequest): string => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${escapeHtml(item.name)}</strong>
          ${item.color ? `<br><span style="color: #666;">Color: ${escapeHtml(item.color)}</span>` : ""}
          ${item.model ? `<br><span style="color: #666;">Model: ${escapeHtml(item.model)}</span>` : ""}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - VEIL</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%); padding: 40px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 32px; letter-spacing: 4px;">VEIL</h1>
          <p style="color: #888; margin: 10px 0 0; font-size: 14px;">Premium Phone Protection</p>
        </div>
        
        <!-- Order Confirmation -->
        <div style="padding: 40px;">
          <h2 style="color: #0A0A0A; margin: 0 0 20px;">Thank you for your order!</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${escapeHtml(order.customerName)},<br><br>
            We've received your order and are getting it ready. We'll notify you when it ships.
          </p>
          
          <!-- Order Number -->
          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
            <p style="margin: 5px 0 0; color: #D4AF37; font-size: 20px; font-weight: bold;">${escapeHtml(order.orderNumber)}</p>
          </div>
          
          <!-- Order Items -->
          <h3 style="color: #0A0A0A; margin: 30px 0 15px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 12px; text-align: left; color: #666; font-weight: 600;">Item</th>
                <th style="padding: 12px; text-align: center; color: #666; font-weight: 600;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #666; font-weight: 600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Order Summary -->
          <div style="border-top: 2px solid #eee; margin-top: 20px; padding-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Subtotal</td>
                <td style="padding: 8px 0; text-align: right;">${formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Shipping</td>
                <td style="padding: 8px 0; text-align: right;">${order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Tax</td>
                <td style="padding: 8px 0; text-align: right;">${formatPrice(order.tax)}</td>
              </tr>
              <tr style="border-top: 2px solid #D4AF37;">
                <td style="padding: 15px 0; font-size: 18px; font-weight: bold;">Total</td>
                <td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold; color: #D4AF37;">${formatPrice(order.total)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Shipping Address -->
          <h3 style="color: #0A0A0A; margin: 30px 0 15px;">Shipping Address</h3>
          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
            <p style="margin: 0; line-height: 1.8; color: #333;">
              <strong>${escapeHtml(order.shippingAddress.fullName)}</strong><br>
              ${escapeHtml(order.shippingAddress.address)}<br>
              ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.state)} ${escapeHtml(order.shippingAddress.pincode)}<br>
              Phone: ${escapeHtml(order.shippingAddress.phone)}
            </p>
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

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication using getClaims() for proper JWT validation
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

    // Use getClaims() for proper JWT verification per Lovable Cloud guidelines
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !data?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = data.claims.sub;
    console.log("Authenticated user:", userId);

    // Parse and validate request body using zod schema
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parseResult = orderEmailSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error("Validation failed:", parseResult.error.flatten());
      return new Response(
        JSON.stringify({ error: "Invalid order data provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const orderData = parseResult.data;
    console.log("Sending order confirmation for:", orderData.orderNumber, "by user:", userId);

    const emailHtml = generateOrderEmailHtml(orderData);

    // Send to customer
    const customerEmail = await sendEmail({
      from: "VEIL <orders@resend.dev>",
      to: [orderData.customerEmail],
      subject: `Order Confirmed - ${orderData.orderNumber} | VEIL`,
      html: emailHtml,
    });

    console.log("Customer email sent:", customerEmail);

    // Send copy to admin using server-side environment variable (not client-provided)
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    if (ADMIN_EMAIL) {
      const adminEmailResult = await sendEmail({
        from: "VEIL Orders <orders@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `[NEW ORDER] ${orderData.orderNumber} - ${orderData.customerName}`,
        html: emailHtml,
      });
      console.log("Admin email sent:", adminEmailResult);
    }

    return new Response(
      JSON.stringify({ success: true, customerId: customerEmail.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    // Log detailed error server-side only
    console.error("Error in send-order-confirmation:", error);
    // Return generic message to client (no internal details)
    return new Response(
      JSON.stringify({ error: "Unable to send order confirmation. Please try again or contact support." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(null) },
      }
    );
  }
};

serve(handler);
