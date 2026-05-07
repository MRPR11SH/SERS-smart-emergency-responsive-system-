import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

/* ── Use Node's built-in https (bypasses native fetch TLS issues) ── */
function httpsPost(
  hostname: string,
  path: string,
  headers: Record<string, string>,
  body: string
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: "POST",
        headers: {
          ...headers,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, text: data }));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/* ── Normalize to 10-digit Indian number ── */
function normalizePhone(raw: string): string {
  let n = raw.replace(/[\s\-\+\(\)]/g, "");
  if (n.length === 12 && n.startsWith("91")) n = n.slice(2);
  if (!/^[6-9]\d{9}$/.test(n)) throw new Error(`Invalid Indian mobile: ${raw}`);
  return n;
}

/* ── Fast2SMS via node:https ── */
async function sendFast2SMS(
  phone10: string,
  message: string
): Promise<{ ok: boolean; detail: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return { ok: false, detail: "FAST2SMS_API_KEY not set" };

  const body = JSON.stringify({
    route: "q",
    message,
    language: "english",
    flash: 0,
    numbers: phone10,
  });

  console.log("[Fast2SMS] Calling API for:", phone10);

  try {
    const { status, text } = await httpsPost(
      "www.fast2sms.com",
      "/dev/bulkV2",
      {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body
    );

    console.log("[Fast2SMS] HTTP", status, "→", text);

    const data = JSON.parse(text) as Record<string, unknown>;
    if (data.return === true) return { ok: true, detail: "SMS sent via Fast2SMS" };

    const msgs = Array.isArray(data.message)
      ? (data.message as string[]).join(", ")
      : String(data.message ?? "unknown error");
    return { ok: false, detail: `Fast2SMS (${status}): ${msgs}` };
  } catch (e) {
    return { ok: false, detail: "Fast2SMS https error: " + String(e) };
  }
}

/* ── Twilio (optional fallback) ── */
async function sendTwilio(
  phone10: string,
  message: string
): Promise<{ ok: boolean; detail: string }> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { ok: false, detail: "Twilio not configured" };

  const to   = "+91" + phone10;
  const body = new URLSearchParams({ To: to, From: from, Body: message }).toString();
  const creds = Buffer.from(`${sid}:${token}`).toString("base64");

  try {
    const { status, text } = await httpsPost(
      "api.twilio.com",
      `/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        Authorization: "Basic " + creds,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body
    );
    if (status >= 200 && status < 300) return { ok: true, detail: "SMS sent via Twilio" };
    return { ok: false, detail: `Twilio (${status}): ${text}` };
  } catch (e) {
    return { ok: false, detail: "Twilio error: " + String(e) };
  }
}

/* ── Handler ── */
export async function POST(req: NextRequest) {
  try {
    const { phone, lat, lng, text } = (await req.json()) as {
      phone: string;
      lat: number;
      lng: number;
      text?: string;
    };

    if (!phone || lat == null || lng == null) {
      return NextResponse.json(
        { ok: false, error: "Missing phone, lat, or lng" },
        { status: 400 }
      );
    }

    const phone10 = normalizePhone(phone);
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const now     = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Use provided custom text or fallback to default
    const message = text || (
      `🚨 EMERGENCY ALERT!\n` +
      `I need immediate help!\n\n` +
      `📍 Location: ${mapsUrl}\n` +
      `🕐 ${now}\n\n` +
      `(SERA Emergency App)`
    );

    const errors: string[] = [];

    for (const fn of [sendFast2SMS, sendTwilio]) {
      const r = await fn(phone10, message);
      if (r.ok) {
        console.log(`✅ ${r.detail}`);
        return NextResponse.json({ ok: true, via: r.detail });
      }
      console.warn(`⚠️  ${r.detail}`);
      errors.push(r.detail);
    }

    return NextResponse.json(
      { ok: false, error: errors.join(" | ") },
      { status: 500 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-alert]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
