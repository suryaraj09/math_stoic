# Socratic Math Tutor

A compassionate AI math tutor that guides students through algebra and calculus problems one step at a time. Instead of immediately giving away the answer, it uses a Socratic approach to help learners understand the reasoning behind each step. You can ask questions in chat or upload an image of a math problem.

## Features

- **Step-by-step tutoring:** Encourages you to solve problems yourself instead of simply presenting a final answer.
- **Image input:** Upload a photo or screenshot of a math problem.
- **Conversational context:** Sends recent conversation history so the tutor can respond in context.
- **Formatted mathematics:** Renders Markdown and mathematical notation with KaTeX.
- **Gemini-powered responses:** Uses Gemini 3.1 Pro Preview for responses, with a Gemini 3.5 Flash fallback when the primary model is rate-limited.

## Tech stack

- React 19 and TypeScript
- Vite
- Express
- Google GenAI SDK
- Tailwind CSS
- React Markdown, Remark Math, and KaTeX

## Requirements

- Node.js (a current LTS release is recommended)
- npm
- A Google Gemini API key

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/suryaraj09/math_stoic.git
cd math_stoic
```

### 2. Install dependencies

```bash
npm install
```

The repository also includes a `bun.lock` file if you prefer to use Bun.

### 3. Configure environment variables

Copy the example environment file:

**macOS / Linux**
```bash
cp .env.example .env
```

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

Open `.env` and set `GEMINI_API_KEY` to your own Google Gemini API key. Do not commit your real API key or share it publicly.

```dotenv
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="your_app_url"
```

`GEMINI_API_KEY` is required for AI responses. `APP_URL` is included for hosted/AI Studio environments; the local server code currently listens on port `3000`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The development server runs Express and uses Vite middleware to serve the React app.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the frontend and bundle the server into `dist/server.cjs` |
| `npm start` | Run the built server (run the build first) |
| `npm run preview` | Preview the Vite frontend build |
| `npm run lint` | Run the TypeScript compiler checks without emitting files |

For a production build, run:

```bash
npm run build
npm start
```

The server uses port `3000` as configured in `server.ts`.

## How to use the tutor

1. Open the app and enter your name to begin a session.
2. Type a math question, or use the image button to upload a problem.
3. Read the tutor's first step and respond with your reasoning or ask why that step works.
4. Continue the conversation to work through the problem step by step.

The tutor is designed to support learning, so it may guide you through a problem rather than reveal the full solution immediately.

## API

The Express server exposes one chat endpoint:

- `POST /api/chat`: Accepts a JSON body with `message`, optional `history`, and optional `imageBase64` plus `mimeType`. Returns the tutor response as JSON.

Keep API keys on the server. Do not expose `GEMINI_API_KEY` in client-side code.

## Troubleshooting

- **Missing API key:** Confirm `GEMINI_API_KEY` is set in your environment or local `.env` file.
- **Rate limits:** The server attempts a fallback model when the primary Gemini model returns a rate-limit error. If both models are limited, wait and try again later.
- **Port already in use:** Stop the process using port `3000` before starting the app again.
- **TypeScript check fails:** Run `npm run lint` and review the reported file and line numbers.

## License

The source includes Apache-2.0 license headers. Add or verify a repository-level license file before relying on a specific distribution license for the entire project.
