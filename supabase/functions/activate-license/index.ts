import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, reason: "method_not_allowed" }, 405);

  try {
    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";

    if (code.length < 12 || code.length > 80 || !/^[A-Z0-9-]+$/.test(code)) {
      return json({ ok: false, reason: "invalid_code" }, 400);
    }
    if (deviceId.length < 16 || deviceId.length > 100) {
      return json({ ok: false, reason: "invalid_device" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ ok: false, reason: "server_not_configured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const licenseHash = await sha256Hex(code);

    const { data: found, error: findError } = await admin
      .from("studyflow_licenses")
      .select("id,status,device_id")
      .eq("license_hash", licenseHash)
      .maybeSingle();

    if (findError) return json({ ok: false, reason: "server_error" }, 500);
    if (!found) return json({ ok: false, reason: "invalid_code" }, 404);
    if (found.status !== "active") return json({ ok: false, reason: "license_inactive" }, 403);

    let boundDevice = found.device_id as string | null;
    if (!boundDevice) {
      const { data: claimed, error: claimError } = await admin
        .from("studyflow_licenses")
        .update({ device_id: deviceId, activated_at: new Date().toISOString() })
        .eq("id", found.id)
        .eq("status", "active")
        .is("device_id", null)
        .select("device_id")
        .maybeSingle();

      if (claimError) return json({ ok: false, reason: "server_error" }, 500);
      if (claimed) {
        boundDevice = claimed.device_id;
      } else {
        const { data: latest, error: latestError } = await admin
          .from("studyflow_licenses")
          .select("status,device_id")
          .eq("id", found.id)
          .maybeSingle();
        if (latestError || !latest) return json({ ok: false, reason: "server_error" }, 500);
        if (latest.status !== "active") return json({ ok: false, reason: "license_inactive" }, 403);
        boundDevice = latest.device_id;
      }
    }

    if (boundDevice !== deviceId) {
      return json({ ok: false, reason: "device_mismatch" }, 409);
    }

    const checkedAt = new Date();
    const validUntil = new Date(checkedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    await admin.from("studyflow_licenses")
      .update({ last_seen_at: checkedAt.toISOString() })
      .eq("id", found.id);

    return json({
      ok: true,
      status: "active",
      checkedAt: checkedAt.toISOString(),
      validUntil: validUntil.toISOString(),
    });
  } catch (_error) {
    return json({ ok: false, reason: "bad_request" }, 400);
  }
});
