import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, email, otp, password } = await req.json();

    // ─── SEND OTP ───
    if (action === "send") {
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user exists FIRST
      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = userData?.users?.some(
        (u: any) => u.email?.toLowerCase() === normalizedEmail
      );

      if (!userExists) {
        return new Response(
          JSON.stringify({ error: "No account found with this email address." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const otpCode = generateOTP();
      const otpHash = await hashOTP(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Invalidate any existing unused OTPs for this email
      await supabaseAdmin
        .from("password_reset_otps")
        .update({ used: true })
        .eq("email", normalizedEmail)
        .eq("used", false);

      // Store hashed OTP
      const { error: insertError } = await supabaseAdmin
        .from("password_reset_otps")
        .insert({
          email: normalizedEmail,
          otp_hash: otpHash,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error("OTP insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Something went wrong. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send email via SMTP (Gmail)
      const smtpUser = Deno.env.get("SMTP_USER");
      const smtpPass = Deno.env.get("SMTP_PASS");

      if (!smtpUser || !smtpPass) {
        console.error("SMTP credentials not configured");
        return new Response(
          JSON.stringify({ error: "Email service is not configured. Please contact support." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const client = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 465,
            tls: true,
            auth: {
              username: smtpUser,
              password: smtpPass,
            },
          },
        });

        await client.send({
          from: smtpUser,
          to: normalizedEmail,
          subject: "Your VEIL Password Reset Code",
          content: "auto",
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0A0A0A; color: #F5F5F5; border-radius: 12px;">
              <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 0.15em; margin: 0 0 32px;">VEIL</h1>
              <p style="font-size: 15px; line-height: 1.6; color: #A0A0A0; margin: 0 0 24px;">Your verification code is:</p>
              <div style="font-size: 36px; font-weight: 700; letter-spacing: 0.3em; text-align: center; padding: 20px; background: #1A1A1A; border-radius: 8px; border: 1px solid #2A2A2A; margin: 0 0 24px;">${otpCode}</div>
              <p style="font-size: 13px; color: #666; margin: 0;">It expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
          `,
        });

        await client.close();
        console.log("Email sent successfully via SMTP to:", normalizedEmail);
      } catch (emailErr) {
        console.error("SMTP send error:", emailErr);
        return new Response(
          JSON.stringify({ error: "Failed to send verification email. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "A verification code has been sent to your email." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── VERIFY OTP ───
    if (action === "verify") {
      if (!email || !otp) {
        return new Response(
          JSON.stringify({ error: "Email and OTP are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const otpHash = await hashOTP(otp);

      const { data, error } = await supabaseAdmin
        .from("password_reset_otps")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .eq("otp_hash", otpHash)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired code. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return a verification token (the OTP record ID)
      return new Response(
        JSON.stringify({ verified: true, token: data.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── RESET PASSWORD ───
    if (action === "reset") {
      if (!email || !password || !otp) {
        return new Response(
          JSON.stringify({ error: "Email, OTP, and password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Re-verify the OTP
      const otpHash = await hashOTP(otp);
      const { data: otpRecord, error: otpError } = await supabaseAdmin
        .from("password_reset_otps")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .eq("otp_hash", otpHash)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired code. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find user by email
      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      const targetUser = userData?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase().trim()
      );

      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: "Unable to reset password. Please contact support." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password }
      );

      if (updateError) {
        console.error("Password update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update password. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark OTP as used
      await supabaseAdmin
        .from("password_reset_otps")
        .update({ used: true })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ message: "Password updated successfully!" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Password reset error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
