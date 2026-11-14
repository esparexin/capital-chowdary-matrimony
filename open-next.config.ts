import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});
// Prevent recursion when package.json "build" script is "opennextjs-cloudflare build"
config.buildCommand = "next build";

export default config;
