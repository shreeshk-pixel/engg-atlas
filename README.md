# ATLAS — ISE Mission Control

Personal all-in-one dashboard for Information Science & Engineering students.  
SpaceX / Mission Control aesthetic. Live updates. AI powered.

## One-Click Launch (Recommended)

**For development (live updates - recommended):**
- Double-click `start-atlas.bat`

This starts the dev server + automatically opens your browser at http://localhost:5173  
**Keep the black window open** (you can minimize it).  
Any change you make to the code = browser updates instantly.

**For production preview (static build):**
- Double-click `start-atlas-prod.bat`

## How to make it even more one-click

1. Right-click `start-atlas.bat`
2. Send to → Desktop (create shortcut)
3. Rename the shortcut on desktop to "ATLAS"
4. (Optional) Right-click shortcut → Pin to Start or Pin to Taskbar

Now you have true one-click from desktop.

## First Time Setup

```cmd
cd "C:\Users\ASUS\Desktop\engg easier life helper"
npm install
```

Then use the .bat files above.

## AI Features (Emergent / OpenAI compatible)

1. Open ATLAS
2. Go to **SETTINGS** tab
3. Paste your API key + endpoint (default: https://api.openai.com/v1)
4. Use **AI OPS** tab for:
   - Lecture notes summarizer
   - Study plan generator
   - Real-time doubt solving chat

Data stays in your browser only (localStorage).

## Features

- Overview dashboard (CGPA, today classes, upcoming tasks)
- Timetable editor (Mon-Sat, subjects, rooms)
- Assignments tracker with due dates + completion
- Academics / CGPA calculator (VTU 10-point scale, ISE/CSE subjects)
- AI tools (notes → summary, goal → 7-day plan, chat)
- Fully dark futuristic mission-control UI

## Stop the server

Close the black command window, or press Ctrl+C inside it.

## Tech

Vite + React + TypeScript + Tailwind  
No backend. Everything local.

Built for one cadet. All systems nominal.
