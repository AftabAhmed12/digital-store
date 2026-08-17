import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Blog from "../models/Blog.js";

dotenv.config();
await connectDB();

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const auth = "Basic " + Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString("base64");

async function getInfo(publicId) {
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload/${publicId}`, { headers: { Authorization: auth } });
  if (!res.ok) return `HTTP ${res.status}`;
  const j = await res.json();
  return `${j.width}x${j.height} (${Math.round(j.bytes / 1024)}KB)`;
}

const blogs = await Blog.find({ isPublished: true }).select("title coverImage").lean();
console.log("Blogs:", blogs.length);
for (const b of blogs) {
  const pid = b.coverImage?.publicId;
  if (!pid) { console.log(`- ${b.title} -> NO COVER`); continue; }
  console.log(`- ${b.title} -> ${await getInfo(pid)}`);
}
process.exit(0);
