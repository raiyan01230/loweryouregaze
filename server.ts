import express from "express";
import path from "path";
import dotenv from "dotenv";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// S3 Configurations with safe, production-grade fallback values
const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-2",
  endpoint: process.env.S3_ENDPOINT || "https://7htx4z75.us-east.insforge.app/storage/v1/s3",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "INSF2JNY0IL2OMF2X7SM",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "j0_JedIBVzeKhxyBPygtW75kGIzxXFX6IhYtCiYK",
  },
  forcePathStyle: true,
});

let BUCKET_NAME = process.env.S3_BUCKET_NAME || "Video";
if (BUCKET_NAME.startsWith("Video")) {
  BUCKET_NAME = "Video";
}
const VIDEO_KEY = "Video_Project.mp4";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Health check API route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 2. Proxy endpoint for streaming /Video_Project.mp4 from S3
  // Handles HTTP Range requests natively for smooth cinematic video playback & scrubbing
  app.get("/Video_Project.mp4", async (req, res) => {
    try {
      const range = req.headers.range;
      console.log(`[Video Proxy] Request for /Video_Project.mp4, Range: ${range || "None"}`);

      const s3Params: any = {
        Bucket: BUCKET_NAME,
        Key: VIDEO_KEY,
      };

      if (range) {
        s3Params.Range = range;
      }

      const command = new GetObjectCommand(s3Params);
      const s3Response = await s3Client.send(command);

      // Copy relevant S3 headers to the Express response
      if (s3Response.ContentType) {
        res.setHeader("Content-Type", s3Response.ContentType);
      } else {
        res.setHeader("Content-Type", "video/mp4");
      }

      if (s3Response.ContentLength) {
        res.setHeader("Content-Length", s3Response.ContentLength);
      }

      res.setHeader("Accept-Ranges", "bytes");

      if (s3Response.ContentRange) {
        res.setHeader("Content-Range", s3Response.ContentRange);
        res.status(206); // Partial Content
      } else {
        res.status(200); // OK
      }

      // Stream the video chunk directly from S3 to the client
      const bodyStream = s3Response.Body as any;
      if (bodyStream && typeof bodyStream.pipe === "function") {
        bodyStream.pipe(res);
      } else {
        res.status(404).send("Video content stream is unavailable.");
      }
    } catch (error: any) {
      console.error("[Video Proxy Error] Error streaming video from S3:", error);
      res.status(500).send("Error loading video content.");
    }
  });

  // 3. Mount Vite Dev Server or Serve Production Static Assets
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
