# SSC Vedic Age & Mahajanapadas Mock Test with IP-based attempt counter

## What it does
- Hosts the existing 30-question mock test as a website.
- Counts each time a visitor presses **Start test**.
- Shows the attempt count associated with that visitor's public IP.
- Saves the count in SQLite so it survives server restarts **when deployed with persistent storage**.
- Stores a keyed hash of the IP, not the raw IP address.

## Important limitations
- This is a **public-IP / network counter**, not a unique-person or unique-device counter.
- People sharing the same Wi-Fi/public IP share one count.
- Mobile networks, VPNs, changing IPs, and carrier-grade NAT can make one person appear as multiple visitors or several people appear as one.
- The counter works only when the test is opened from its hosted website URL. A downloaded HTML file opened directly from WhatsApp/Files cannot update the shared online counter.
- One click on Start test counts as one attempt. Retaking and starting again counts again.

## Deploy
This folder is a ready-to-deploy Node.js app, but it is not yet online. You need a hosting account.

1. Upload this folder to a GitHub repository.
2. Create a new **Web Service** on a Node.js host such as Render and connect the repository.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add environment variable `IP_HASH_SECRET` with a long random secret (at least 32 random characters).
5. Add a persistent disk/volume mounted at `/var/data`.
6. Add environment variable `DATA_DIR=/var/data`.
7. Deploy. Share the resulting website URL with students. They should use that same URL rather than downloading the HTML file.

**Do not skip persistent storage.** Without a persistent disk/volume, the database may reset when the host replaces the app instance.

## Local preview
Requires Node.js 20+:
```bash
npm install
# Set IP_HASH_SECRET to a long random value
# Linux/macOS:
IP_HASH_SECRET='replace-with-a-long-random-secret' npm start
# Windows PowerShell:
$env:IP_HASH_SECRET='replace-with-a-long-random-secret'; npm start
```
Then open http://localhost:3000. Local preview counts your local connection and is not a public shared counter.
