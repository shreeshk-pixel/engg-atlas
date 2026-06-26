# Deploy to Vercel (Access from anywhere)

This app is 100% static (Vite build). It works great on Vercel.

**Important limitations (read this):**
- All your data (timetable, assignments, grades, notes) lives only in your browser's localStorage.
- Different devices/browsers = separate data. No automatic sync.
- Your LLM API key is also stored only in the browser where you paste it.
- AI features call your LLM provider directly from the browser (no server). If the provider blocks browser requests (CORS), AI won't work until we add a small proxy.

If you want cross-device sync later, we'll need a backend + database + login.

---

## Step-by-step: Deploy on Vercel

### 1. Push to GitHub (recommended)

Open **Command Prompt** (or PowerShell) and run:

```cmd
cd /d "C:\Users\ASUS\Desktop\engg easier life helper"

:: Initialize git if not already done
git init
git add .
git commit -m "Initial ATLAS mission control"

:: Create a repo on GitHub first (private recommended), then:
git remote add origin https://github.com/YOUR_USERNAME/engg-atlas.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME/engg-atlas` with your actual repo name.

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New Project** → **Import Git Repository**
4. Select your `engg-atlas` repo
5. Vercel should auto-detect **Vite** (Framework Preset = Vite)
6. Click **Deploy**

First deploy usually takes < 1 minute.

After it's live, copy the URL (something like `engg-atlas.vercel.app`).

### 3. Use it from anywhere

- Open the Vercel URL on any device/browser
- Go to **SETTINGS** tab
- Paste your Emergent / OpenAI-compatible API key + endpoint
- Start using (Timetable, Assignments, AI OPS, etc.)

The key and all data stay only in that browser's localStorage.

### 4. Updates (keep it always fresh)

Just make changes locally, then:

```cmd
git add .
git commit -m "added study plan feature"
git push
```

Vercel auto-deploys on every push. Your live site updates in ~30-60 seconds.

---

## Already have vercel.json?

Yes — this project already includes `vercel.json` with correct SPA routing.

---

## Quick local test before pushing

```cmd
cd /d "C:\Users\ASUS\Desktop\engg easier life helper"
npm run build
npm run preview
```

Open http://localhost:5173 — if everything works, you're good to push.

---

## Optional: Custom domain

On Vercel project → Settings → Domains → add your domain (free .vercel.app works fine too).

---

## Want AI to work more reliably from browser?

Most OpenAI keys work directly.  
If your Emergent key gives CORS errors on the deployed site, tell me — we can add a tiny Vercel serverless function as a proxy (one extra file).

For now, direct calls are simplest.

All systems ready for deployment.
