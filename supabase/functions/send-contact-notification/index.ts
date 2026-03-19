import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";

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

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || SMTP_USER;

    if (!SMTP_USER || !SMTP_PASS) {
      console.error("SMTP credentials not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="border:1px solid #C9A96E;border-radius:12px;padding:32px;background:#111111;">
      <h1 style="color:#C9A96E;font-size:20px;margin:0 0 24px;">New Contact Form Submission</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#888;font-size:13px;width:80px;">Name:</td>
          <td style="padding:8px 0;color:#fff;font-size:14px;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;font-size:13px;">Email:</td>
          <td style="padding:8px 0;color:#fff;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#C9A96E;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#888;font-size:13px;">Subject:</td>
          <td style="padding:8px 0;color:#fff;font-size:14px;">${safeSubject}</td>
        </tr>
      </table>
      <div style="margin-top:20px;padding:16px;background:#080808;border-radius:8px;border:1px solid #1f1f1f;">
        <p style="color:#888;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Message</p>
        <p style="color:#fff;font-size:14px;margin:0;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
      </div>
      <p style="color:#555;font-size:11px;margin-top:24px;">Sent from VEIL Contact Form • ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"VEIL Contact" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `[VEIL Contact] ${subject}`,
      html: htmlContent,
      replyTo: email,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact notification error:", error);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
