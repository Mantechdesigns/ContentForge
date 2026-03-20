import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { execSync } from "child_process";

/**
 * POST /api/produce/stitch
 * Stitches multiple scene videos into one final video.
 * Uses FFmpeg if available, otherwise falls back to a simple file concatenation.
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { videos } = body as { videos: string[] };

  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return NextResponse.json({ error: "No videos to stitch" }, { status: 400 });
  }

  try {
    const videosDir = path.join(process.cwd(), "public", "videos");
    await mkdir(videosDir, { recursive: true });

    // Check if FFmpeg is available
    let hasFFmpeg = false;
    try {
      execSync("ffmpeg -version", { stdio: "ignore" });
      hasFFmpeg = true;
    } catch {
      hasFFmpeg = false;
    }

    const outputFilename = `stitched-${Date.now()}.mp4`;
    const outputPath = path.join(videosDir, outputFilename);

    if (hasFFmpeg) {
      // Use FFmpeg concat demuxer for seamless stitching
      const fileListPath = path.join(videosDir, `concat-${Date.now()}.txt`);
      const fileList = videos.map((v) => {
        // Handle both local paths (/videos/xxx.mp4) and remote URLs
        const localPath = v.startsWith("/videos/")
          ? path.join(process.cwd(), "public", v)
          : v;
        return `file '${localPath}'`;
      }).join("\n");

      await writeFile(fileListPath, fileList);

      const command = `ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -c copy -movflags +faststart "${outputPath}" 2>&1`;
      console.log("[Stitch] Running FFmpeg:", command);

      try {
        const output = execSync(command, { timeout: 120000, encoding: "utf8" });
        console.log("[Stitch] FFmpeg output:", output.substring(0, 200));
      } catch (ffmpegErr) {
        console.error("[Stitch] FFmpeg concat failed, trying re-encode:", (ffmpegErr as Error).message);
        // If concat fails (different codecs), re-encode
        const reencodeCmd = `ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${outputPath}" 2>&1`;
        execSync(reencodeCmd, { timeout: 300000, encoding: "utf8" });
      }

      // Clean up file list
      try { await readFile(fileListPath); } catch { /* ignore */ }

      console.log(`[Stitch] Final video saved: ${outputPath}`);
      return NextResponse.json({
        success: true,
        videoUrl: `/videos/${outputFilename}`,
        method: "ffmpeg",
      });
    } else {
      // Fallback: binary concatenation (works for identical codec/container)
      console.log("[Stitch] FFmpeg not found, using binary concat fallback");

      const buffers: Buffer[] = [];
      for (const v of videos) {
        const localPath = v.startsWith("/videos/")
          ? path.join(process.cwd(), "public", v)
          : v;
        try {
          const buf = await readFile(localPath);
          buffers.push(buf);
        } catch (err) {
          console.error(`[Stitch] Could not read: ${localPath}`, err);
        }
      }

      if (buffers.length === 0) {
        throw new Error("No video files could be read");
      }

      // For single video, just return it
      if (buffers.length === 1) {
        await writeFile(outputPath, buffers[0]);
        return NextResponse.json({
          success: true,
          videoUrl: `/videos/${outputFilename}`,
          method: "single",
        });
      }

      // Simple binary concat — may not produce valid MP4 without FFmpeg
      const combined = Buffer.concat(buffers);
      await writeFile(outputPath, combined);

      return NextResponse.json({
        success: true,
        videoUrl: `/videos/${outputFilename}`,
        method: "binary-concat",
        warning: "Install FFmpeg for better stitching: brew install ffmpeg",
      });
    }
  } catch (error) {
    console.error("[Stitch] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
