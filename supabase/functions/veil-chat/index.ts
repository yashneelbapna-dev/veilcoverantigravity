import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("VEIL Chat: request received");
    const { message, history } = await req.json();

    if (!message || typeof message !== "string" || message.length > 2000) {
      return new Response(
        JSON.stringify({ reply: "Please send a valid message." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── AUTHENTICATE USER (optional — guests allowed) ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      // Skip if token is the anon key (unauthenticated guest)
      if (token !== anonKey) {
        const authClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data, error } = await authClient.auth.getClaims(token);
        if (!error && data?.claims?.sub) {
          userId = data.claims.sub as string;
        }
      }
    }

    // ── FETCH LIVE DATA ──────────────────────

    const { data: products } = await supabase
      .from("products")
      .select("id, name, price, compare_price, colors, models, category, collection, description, in_stock, stock_quantity, rating, review_count")
      .order("created_at", { ascending: false });

    let orders: any[] = [];
    let profile: any = null;
    let addresses: any[] = [];

    if (userId) {
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, order_number, order_status, payment_status, total, items, shipping_address, tracking_number, carrier, estimated_delivery, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      orders = orderData || [];

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("user_id", userId)
        .single();
      profile = profileData;

      const { data: addressData } = await supabase
        .from("user_addresses")
        .select("name, phone, address_line1, address_line2, city, state, pincode, is_default")
        .eq("user_id", userId);
      addresses = addressData || [];
    }

    // Only show the authenticated user's own coupons (scoped by email)
    let coupons: any[] = [];
    if (userId && profile?.email) {
      const { data: couponData } = await supabase
        .from("discount_coupons")
        .select("coupon_code, source, is_used")
        .eq("is_used", false)
        .eq("email", profile.email)
        .limit(5);
      coupons = couponData || [];
    }

    // ── BUILD SYSTEM PROMPT ──────────────────

    const systemPrompt = `
You are VEIL Assistant — the official AI helper for VEIL, an ultra-premium phone case brand based in India. You speak with a premium, warm, and helpful tone. Never sound robotic. Be concise.

BRAND PERSONALITY:
- Premium but approachable
- Confident, not salesy
- Honest about stock and availability
- Always helpful, never dismissive

YOU HAVE ACCESS TO THIS LIVE DATA:

PRODUCTS (${products?.length || 0} total):
${JSON.stringify(products?.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  comparePrice: p.compare_price,
  colors: p.colors,
  models: p.models,
  category: p.category,
  collection: p.collection,
  inStock: p.in_stock,
  stockQty: p.stock_quantity,
  rating: p.rating,
  reviewCount: p.review_count,
  description: p.description
})) || [], null, 2)}

ACTIVE COUPONS:
${JSON.stringify(coupons || [], null, 2)}

${userId ? `
LOGGED IN USER: ${profile?.full_name || "Customer"}
USER ORDERS (most recent 5):
${JSON.stringify(orders.map(o => ({
  orderNumber: o.order_number,
  status: o.order_status,
  paymentStatus: o.payment_status,
  total: o.total,
  items: o.items,
  trackingNumber: o.tracking_number,
  carrier: o.carrier,
  estimatedDelivery: o.estimated_delivery,
  placedAt: o.created_at
})), null, 2)}

USER SAVED ADDRESSES:
${JSON.stringify(addresses, null, 2)}
` : "USER: Not logged in (guest)"}

STORE POLICIES:
- Free shipping on orders above ₹999
- 7-day easy returns on unused products
- COD available on all orders
- Delivery within 5-7 business days

WHAT YOU CAN DO:
1. Answer product questions (materials, compatibility, price, stock)
2. Track and explain order status for logged-in users
3. Recommend products based on user needs
4. Share coupon codes if available
5. Explain shipping, returns and warranty policies
6. Help users find their saved addresses
7. Guide users to the right page on the site

WHAT YOU CANNOT DO:
- Place or cancel orders (tell user to go to their orders page at /account?tab=orders)
- Process refunds (tell user to contact support via /contact)
- Access other users' data
- Make up product information — only use data provided above

RESPONSE RULES:
- Keep replies under 3 sentences unless listing multiple items
- When listing products, format as clean bullet points
- Include product page links as: /product/[id] (use the actual product id)
- If user asks for a coupon, show the code clearly
- If something is out of stock, suggest alternatives
- End with a helpful follow-up question when appropriate
- Use ₹ for prices (Indian Rupees)
- If user is not logged in and asks about orders, say "Please log in to view your orders"
- Format prices: if price is stored in paise (e.g. 449900), divide by 100 to show ₹4,499
`;

    // ── BUILD CONVERSATION HISTORY ───────────

    const conversationHistory = (history || []).slice(-8).map((msg: any) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.content,
    }));

    const allMessages = [
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // ── CALL LOVABLE AI ──────────────────────

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const sessionId = req.headers.get("x-session-id") || "anonymous";

    if (!lovableKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("VEIL Chat: calling Lovable AI...");
    const upstreamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...allMessages,
        ],
      }),
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      console.error("Lovable AI error:", upstreamResponse.status, errText);
      if (upstreamResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (upstreamResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ reply: "I'm having trouble connecting right now. Please try again in a moment." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── TRANSFORM STREAM & COLLECT FULL REPLY ──

    const upstreamReader = upstreamResponse.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullReply = "";
    let textBuffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await upstreamReader.read();
            if (done) break;

            textBuffer += decoder.decode(value, { stream: true });

            let newlineIdx: number;
            while ((newlineIdx = textBuffer.indexOf("\n")) !== -1) {
              const line = textBuffer.slice(0, newlineIdx).replace(/\r$/, "").trim();
              textBuffer = textBuffer.slice(newlineIdx + 1);

              if (!line || line.startsWith(":")) continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content || "";

                if (content) {
                  fullReply += content;
                  const outEvent = JSON.stringify({
                    choices: [{ delta: { content } }],
                  });
                  controller.enqueue(encoder.encode(`data: ${outEvent}\n\n`));
                }
              } catch {
                // Incomplete JSON — skip line
              }
            }
          }

          // Final flush
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          // Save chat log (fire and forget)
          supabase.from("chat_logs").insert({
            user_id: userId,
            session_id: sessionId,
            user_message: message,
            bot_reply: fullReply || "(empty)",
          }).then(() => {});
        } catch (err) {
          console.error("Stream transform error:", err);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        reply: "I'm having trouble connecting right now. Please try again in a moment.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
