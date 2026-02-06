const fs = require("fs");
require("dotenv").config();

// Get API keys from .env
const OMDB_API_KEY = process.env.OMDB_API_KEY || "";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "";

if (!OMDB_API_KEY || !TMDB_API_KEY) {
  console.error("❌ Error: Missing required API keys in .env file");
  console.error("   Make sure OMDB_API_KEY and TMDB_API_KEY are set");
  process.exit(1);
}

try {
  // Replace in content.js
  let content = fs.readFileSync("./content.js", "utf8");
  content = content.replace("__OMDB_KEY__", OMDB_API_KEY);
  fs.writeFileSync("./content.js", content);
  console.log("✅ Updated content.js with OMDB_API_KEY");

  // Replace in background.js
  let background = fs.readFileSync("./background.js", "utf8");
  background = background.replace("__TMDB_KEY__", TMDB_API_KEY);
  background = background.replace("__TMDB_BEARER_TOKEN__", TMDB_BEARER_TOKEN);
  fs.writeFileSync("./background.js", background);
  console.log("✅ Updated background.js with TMDB keys");

  console.log("✅ Build complete - Environment variables injected");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
