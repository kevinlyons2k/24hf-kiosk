# 24 Hour Fitness Kiosk — Max Virtual Assistant

Guest intake chatbot for tablet/kiosk deployment. Collects registration info and fitness profile through a guided conversation, then produces a team member handoff summary.

---

## Project Structure

```
24hf-kiosk/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── main.jsx   # Entry point
│   │   └── App.jsx    # Main chatbot UI
│   ├── index.html
│   └── vite.config.js
├── backend/           # Express API proxy
│   ├── server.js      # Proxy to Anthropic + system prompt
│   └── .env.example   # Environment variable template
├── vercel.json        # Vercel deployment config
└── README.md
```

---

## Local Development

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Set up environment variables

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

Get your API key at: https://console.anthropic.com

### 3. Start both servers

```bash
# From the root directory — starts frontend + backend together
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health

---

## Deployment to Vercel (Recommended)

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# From the project root
vercel

# Set environment variable
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. In Project Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your key
   - `ALLOWED_ORIGIN` = https://your-app.vercel.app (once you know the URL)
4. Click Deploy

Your app will be live at `https://your-project.vercel.app`

---

## Deployment to Azure (if preferred for Microsoft stack)

### Frontend — Azure Static Web Apps
1. Create a Static Web App in Azure Portal
2. Connect to your GitHub repo
3. Build command: `cd frontend && npm run build`
4. Output path: `frontend/dist`

### Backend — Azure Functions or App Service
1. Deploy `backend/server.js` as an Azure Function (HTTP trigger) or App Service
2. Add `ANTHROPIC_API_KEY` to Application Settings
3. Update `VITE_API_URL` in the frontend to point to your Azure backend URL

---

## Tablet / Kiosk Setup

Once deployed:
1. Open the URL in Chrome or Safari on your tablet
2. On iPad: Safari → Share → "Add to Home Screen" for a full-screen app experience
3. On Android tablet: Chrome → Menu → "Add to Home Screen"
4. Enable Guided Access (iOS) or Screen Pinning (Android) to lock to the app

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | backend/.env | Your Anthropic API key |
| `PORT` | backend/.env | Backend port (default: 3001) |
| `ALLOWED_ORIGIN` | backend/.env | CORS origin (your frontend URL in production) |
| `VITE_API_URL` | Vercel env | Backend URL if frontend/backend on different domains |

---

## Customization

- **System prompt / questions**: Edit `SYSTEM` in `backend/server.js`
- **UI colors / branding**: Edit styles in `frontend/src/App.jsx`
- **Add Dynamics CRM**: Add a `POST /api/submit` endpoint in `backend/server.js` that writes the completed profile to Dynamics after the conversation ends

---

## Security Notes

- API key lives only on the server — never exposed to the browser
- Set `ALLOWED_ORIGIN` to your production domain in production
- Consider adding a simple PIN or staff login before the chat if the kiosk is publicly accessible
