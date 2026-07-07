# Seedance workspace

A frontend workspace for ByteDance's Seedance 2.0 video model, wired up through
Kie.ai's unified task API. This is a scaffold, not a finished product — it
gets the plumbing right (async job lifecycle, multimodal reference uploads,
polling) so you can focus on the parts that make your version distinct.

## What's here

- **Composer** — prompt, mode switch (text-only / first-frame / first+last
  frame / multimodal reference), model + resolution + aspect + duration
  controls, and reference-media pickers that match Seedance 2.0's actual
  input constraints (the three image/reference modes are mutually exclusive
  on the API side, so the UI enforces that too).
- **The reel** — a job gallery that polls Kie.ai until each render finishes
  and plays the result inline.
- **`/api/generate`** — uploads any reference images/video/audio to Kie.ai's
  temporary file host, then calls `POST /api/v1/jobs/createTask`.
- **`/api/jobs/[id]`** — polls `GET /api/v1/jobs/recordInfo` and updates the
  local job record.
- **`lib/store.ts`** — a flat JSON file at `data/jobs.json` standing in for a
  database.

## Setup

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and paste in your key from https://kie.ai/api-key
npm run dev
```

Open http://localhost:3000.

## How a request actually flows

1. You upload reference images/video/audio in the browser — they're read as
   base64 data URLs client-side, nothing touches disk yet.
2. `POST /api/generate` uploads each one to Kie.ai's file host
   (`kieai.redpandaai.co`) and gets back a public, temporary URL.
3. Those URLs go into the `input` object of a
   `POST https://api.kie.ai/api/v1/jobs/createTask` call, along with your
   prompt and settings. Kie.ai returns a `taskId` immediately — the actual
   render happens asynchronously.
4. The browser polls `/api/jobs/[id]` every few seconds; that route calls
   `GET /api/v1/jobs/recordInfo?taskId=...` and updates the job's state
   (`waiting → queuing → generating → success/fail`).
5. On success, `resultJson.resultUrls` gives you a playable video URL.

## Mobile app

There's an Android shell (Capacitor) already scaffolded in `android/`,
wrapping this same app for install as a real `.apk`. It needs the site
deployed to a real URL first — see **[MOBILE_APP.md](./MOBILE_APP.md)** for
the full walkthrough, including a fully browser-based path (Path B) for
building the APK with no local installs at all — useful on older machines
that can't run Android Studio.

## Before this goes anywhere near production

- **Swap the JSON file for a real database.** It's not safe for concurrent
  writes and won't survive a serverless deploy where the filesystem is
  ephemeral. Postgres, SQLite, or Supabase are all fine — `lib/store.ts` is
  the only file that needs to change.
- **Use webhooks instead of polling.** `createTask` accepts a `callBackUrl`
  — once you have a public domain, pass it in `lib/kie.ts` and Kie.ai will
  push the result to you instead of you polling for it. Polling here is a
  local-dev convenience since `localhost` isn't reachable from Kie.ai's
  servers.
- **Re-host the output video.** Kie.ai's generated file URLs are documented
  to expire — download the result and push it to your own storage (S3, R2,
  etc.) as soon as a job succeeds, rather than storing the Kie.ai URL
  long-term.
- **Add auth and metering.** There's no user system or credit tracking here
  — anyone who can reach `/api/generate` can spend your Kie.ai balance.
- **Rate-limit and validate uploads.** File size/type checks currently
  happen only via the `accept` attribute on the file input, which is not a
  security boundary.

## Reference

- Seedance 2.0 on Kie.ai: https://docs.kie.ai/market/bytedance/seedance-2
- Task status polling: https://docs.kie.ai/market/common/get-task-detail
- File upload API: https://docs.kie.ai/file-upload-api/quickstart
