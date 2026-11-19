const express = require("express");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const fs = require("fs");
fs.mkdirSync(DATA_DIR, { recursive: true });

if (!process.env.IP_HASH_SECRET) {
  console.error("Missing IP_HASH_SECRET environment variable. Set a long random secret before deployment.");
  process.exit(1);
}

// Render and similar hosts sit behind one trusted reverse proxy.
app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));

const db = new Database(path.join(DATA_DIR, "attempts.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS attempts (
    ip_hash TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  )
`);

function visitorHash(req) {
  // Store only a keyed hash, never the raw public IP.
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return crypto.createHmac("sha256", process.env.IP_HASH_SECRET).update(ip).digest("hex");
}

app.get("/api/me", (req, res) => {
  const row = db.prepare("SELECT count FROM attempts WHERE ip_hash = ?").get(visitorHash(req));
  res.json({ attempts: row ? row.count : 0 });
});

app.post("/api/attempt", (req, res) => {
  const hash = visitorHash(req);
  db.prepare(`
    INSERT INTO attempts (ip_hash, count, updated_at)
    VALUES (?, 1, datetime('now'))
    ON CONFLICT(ip_hash) DO UPDATE SET
      count = count + 1,
      updated_at = datetime('now')
  `).run(hash);
  const row = db.prepare("SELECT count FROM attempts WHERE ip_hash = ?").get(hash);
  res.json({ attempts: row.count });
});

app.use(express.static(path.join(__dirname)));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(PORT, () => console.log(`Mock test server listening on ${PORT}`));
