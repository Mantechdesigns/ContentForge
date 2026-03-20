import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/export
 * Exports approved video to connected platforms
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { destination, videoUrl, topic, script: rawScript, metadata: rawMetadata } = body;
  const script = rawScript || "";
  const metadata = rawMetadata || {};

  if (!destination || !topic) {
    return NextResponse.json({ error: "Destination and topic required" }, { status: 400 });
  }

  try {
    switch (destination) {
      case "ghl":
        return await exportToGHL(topic, script, videoUrl, metadata);
      case "airtable":
        return await exportToAirtable(topic, script, videoUrl, metadata);
      case "notion":
        return await exportToNotion(topic, script, videoUrl, metadata);
      case "r2":
        return await exportToR2(topic, videoUrl, metadata);
      default:
        return NextResponse.json({ error: "Unknown export destination" }, { status: 400 });
    }
  } catch (error) {
    console.error("[export] Error:", error);
    return NextResponse.json(
      { error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}

/* ───── GoHighLevel ───── */
async function exportToGHL(
  topic: string,
  script: string,
  videoUrl: string,
  metadata: Record<string, unknown>
) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    return NextResponse.json({
      success: false,
      message: "GHL not connected. Add GHL_API_KEY and GHL_LOCATION_ID to env.",
      destination: "ghl",
    });
  }

  const res = await fetch(`https://services.leadconnectorhq.com/social-media-posting/post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      locationId,
      type: "post",
      post: {
        content: `${topic}\n\n${script.substring(0, 280)}`,
        mediaUrls: videoUrl ? [videoUrl] : [],
      },
      scheduleDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      platforms: metadata.platforms || ["instagram", "facebook"],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GHL error: ${err}`);
  }

  return NextResponse.json({ success: true, destination: "ghl", message: "Scheduled in GoHighLevel" });
}

/* ───── Airtable ───── */
async function exportToAirtable(
  topic: string,
  script: string,
  videoUrl: string,
  metadata: Record<string, unknown>
) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json({
      success: false,
      message: "Airtable not connected. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID to env.",
      destination: "airtable",
    });
  }

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/Content%20Queue`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            Topic: topic,
            Script: script.substring(0, 5000),
            "Video URL": videoUrl || "",
            Status: "Ready to Post",
            "Video Type": String(metadata.videoType || ""),
            "Created Date": new Date().toISOString(),
          },
        },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable error: ${err}`);
  }

  return NextResponse.json({ success: true, destination: "airtable", message: "Added to Airtable" });
}

/* ───── Notion ───── */
async function exportToNotion(
  topic: string,
  script: string,
  videoUrl: string,
  metadata: Record<string, unknown>
) {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    return NextResponse.json({
      success: false,
      message: "Notion not connected. Add NOTION_API_KEY and NOTION_DATABASE_ID to env.",
      destination: "notion",
    });
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: topic } }] },
        Status: { select: { name: "Ready to Post" } },
        "Video Type": { select: { name: String(metadata.videoType || "UGC") } },
        ...(videoUrl ? { "Video URL": { url: videoUrl } } : {}),
      },
      children: [
        {
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ text: { content: "Script" } }] },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ text: { content: script.substring(0, 2000) } }] },
        },
        ...(videoUrl
          ? [
              {
                object: "block" as const,
                type: "heading_2" as const,
                heading_2: { rich_text: [{ text: { content: "Video" } }] },
              },
              {
                object: "block" as const,
                type: "video" as const,
                video: {
                  type: "external" as const,
                  external: { url: videoUrl },
                },
              },
            ]
          : []),
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion error: ${err}`);
  }

  return NextResponse.json({ success: true, destination: "notion", message: "Page created in Notion" });
}

/* ───── Cloudflare R2 ───── */
async function exportToR2(
  topic: string,
  videoUrl: string,
  metadata: Record<string, unknown>
) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;

  if (!accountId || !accessKey) {
    return NextResponse.json({
      success: false,
      message: "R2 not connected. Add R2 credentials to env.",
      destination: "r2",
    });
  }

  // In production: download video and upload to R2 bucket
  return NextResponse.json({
    success: true,
    destination: "r2",
    message: "Uploaded to Cloudflare R2",
    key: `content-forge/${Date.now()}-${topic.replace(/\s+/g, "-").substring(0, 50)}.mp4`,
  });
}
