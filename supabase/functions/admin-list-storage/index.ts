import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Restrict CORS to production and development origins
const ALLOWED_ORIGINS = [
  "https://veilcover.lovable.app",
  "https://id-preview--cd4d1662-9d5c-4f46-9ba5-abdece17be90.lovable.app",
  "https://cd4d1662-9d5c-4f46-9ba5-abdece17be90.lovableproject.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin 
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
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

    // Extract token for explicit validation (required when verify_jwt=false)
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // CRITICAL: Must pass token explicitly when verify_jwt=false
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("Auth validation failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = userData.user.id;

    // Verify admin role server-side using service role
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

    // Parse request body
    let body: { bucket?: string; path?: string; userId?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable for listing root
    }

    const bucket = body.bucket || "userdata";
    const path = body.path || "";

    // Use service role to list storage (bypasses RLS as intended for admin)
    const { data: folders, error: listError } = await supabaseAdmin.storage
      .from(bucket)
      .list(path, { limit: 100 });

    if (listError) {
      console.error("Storage list error:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to list storage" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If listing specific user files, download them
    if (body.userId) {
      const { data: files } = await supabaseAdmin.storage
        .from(bucket)
        .list(body.userId);

      if (!files || files.length === 0) {
        return new Response(
          JSON.stringify({ files: [] }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const fileContents = await Promise.all(
        files.map(async (file) => {
          try {
            const { data, error } = await supabaseAdmin.storage
              .from(bucket)
              .download(`${body.userId}/${file.name}`);

            if (error) {
              return { name: file.name, content: null, error: error.message };
            }

            const text = await data.text();
            const parsed = JSON.parse(text);
            return { name: file.name, content: parsed };
          } catch (err) {
            return {
              name: file.name,
              content: null,
              error: err instanceof Error ? err.message : "Parse error",
            };
          }
        })
      );

      return new Response(
        JSON.stringify({ files: fileContents }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user emails for folder display
    const userFolders = folders?.filter((item) => item.id === null) || [];
    const userIds = userFolders.map((folder) => folder.name);

    const foldersWithInfo = await Promise.all(
      userIds.map(async (uid) => {
        const { data: fileList } = await supabaseAdmin.storage
          .from(bucket)
          .list(uid);

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("user_id", uid)
          .single();

        return {
          userId: uid,
          files: fileList?.map((f) => f.name) || [],
          email: profile?.email || undefined,
        };
      })
    );

    return new Response(
      JSON.stringify({ 
        folders: foldersWithInfo.filter((u) => u.files.length > 0) 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in admin-list-storage:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

Deno.serve(handler);
