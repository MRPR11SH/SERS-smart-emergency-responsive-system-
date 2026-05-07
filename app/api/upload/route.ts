import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `sos_audio_${Date.now()}.mp3`;
    
    // Create public/uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if directory already exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Construct full URL dynamically based on how the user accesses the app (localhost or LAN IP)
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    // For local LAN IP development (like 192.168.x.x), it's http
    const finalProtocol = host.match(/^[0-9.]+:/) ? "http" : protocol; 
    const fileUrl = `${finalProtocol}://${host}/play?file=${filename}`;

    return NextResponse.json({ ok: true, url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
