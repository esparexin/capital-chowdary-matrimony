import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "AUTH_SESSION_SECRET",
  "ADMIN_SESSION_COOKIE_NAME",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UPLOAD_FOLDER",
];

const envExamplePath = resolve(process.cwd(), ".env.example");
const content = readFileSync(envExamplePath, "utf8");

const missing = REQUIRED_ENV_KEYS.filter((key) => !content.includes(`${key}=`));
if (missing.length > 0) {
  console.error("Missing required keys in .env.example:", missing.join(", "));
  process.exit(1);
}

console.info("Verified .env.example contains all required configuration keys.");
