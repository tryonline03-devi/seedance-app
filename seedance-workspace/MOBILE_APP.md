# Building the Android app (.apk)

The project now includes `capacitor.config.ts` and an `android/` folder — a
thin native Android shell (via [Capacitor](https://capacitorjs.com)) that
loads your deployed site in a WebView. It's the same app, wrapped — not a
second codebase to maintain.

There are two ways to actually build the `.apk`. Pick whichever matches
your computer.

- **Have Android Studio, or can install it?** Use "Path A" below.
- **Old computer, can't install Android Studio (e.g. Windows 7), or just
  want to skip installing anything at all?** Use "Path B" — it builds the
  APK entirely on GitHub's servers. Your computer only needs a browser.

## Why deployment comes first (both paths)

This app has real server-side code — the Kie.ai calls, your API key, the
file-upload proxy — none of that can be bundled inside an APK. So step one
is always: get the web app running on a real `https://` URL. The APK is just
a shell that points at it, the same way a browser would.

---

## Path A — Android Studio on your own machine

### Step 1 — Deploy the web app

Easiest path is Vercel (free, built for Next.js):

1. Push this project to a GitHub repo, then import it at vercel.com → New
   Project. Or, if you have the Vercel CLI, just run `npx vercel` from this
   folder.
2. In the project's Vercel settings, add an environment variable
   `KIE_API_KEY` with your real key.
3. Deploy. You'll get a URL like `https://seedance-workspace.vercel.app`.

### Step 2 — Point the app at that URL

Open `capacitor.config.ts` and replace the placeholder:

```ts
url: 'https://REPLACE-WITH-YOUR-DEPLOYED-URL.vercel.app',
```

with your real deployed URL. Then re-sync the native project:

```bash
npx cap sync android
```

Run that `sync` command again any time you change the URL.

### Step 3 — Build the APK in Android Studio

1. Install [Android Studio](https://developer.android.com/studio) if you
   don't already have it — free, one-time install.
2. Open the `android/` folder as a project (File → Open).
3. Let Gradle sync finish. The first sync downloads Android SDK components
   and needs a real internet connection — can take a few minutes.
4. Build → Build Bundle(s) / APK(s) → Build APK(s).
5. When it finishes, click "locate" in the notification, or find it at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4 — Install it on a phone

- **Easiest:** plug the phone in by USB with Developer Options → USB
  debugging turned on, then hit the green ▶ Run button in Android Studio.
  It installs and launches automatically.
- **Or:** copy `app-debug.apk` to the phone (WhatsApp-to-yourself works
  fine) and tap it to install. Android will warn that it's from an
  "unknown source" since it's not from the Play Store — expected for a
  debug build, allow it.

---

## Path B — Everything in the browser (no installs at all)

This builds the exact same APK, but the build itself runs on GitHub's
servers instead of your computer. You need: a browser, and about 15
minutes. Nothing gets installed locally — this works even on Windows 7.

A GitHub Actions workflow is already included at
`.github/workflows/build-apk.yml` and does the actual building for you.

### Step 1 — Create a GitHub account and a new repo

1. Go to github.com → sign up (free) if you don't have an account.
2. Click the **+** in the top right → **New repository**.
3. Give it any name (e.g. `seedance-workspace`). **Check "Add a README
   file."** This matters — an empty repo can't open a Codespace.
4. Click **Create repository**.

### Step 2 — Open a Codespace (a free cloud coding environment)

1. On your new repo's page, click the green **Code** button → the
   **Codespaces** tab → **Create codespace on main**.
2. A full coding environment opens in your browser after a short wait —
   this is a real computer in the cloud, running for free (GitHub gives
   every account 120 free hours a month, far more than you'll need here).

### Step 3 — Upload this project into it

1. In the file list on the left, right-click anywhere in the empty space →
   **Upload...** (or just drag the `seedance-workspace.zip` file straight
   from your desktop/downloads folder onto that panel).
2. Once it's uploaded, click the **Terminal** menu → **New Terminal** at
   the bottom of the screen, and paste these lines one at a time, pressing
   Enter after each:

   ```bash
   unzip seedance-workspace.zip -d .
   git add .
   git commit -m "Add Seedance workspace app"
   git push
   ```

   You don't need to understand these — they unzip the project and upload
   it to your repo. If `unzip` says it's overwriting the README, that's
   fine, just let it.

### Step 4 — Deploy the web app (same as Path A, Step 1)

Go to vercel.com → sign in with GitHub → **Add New Project** → import the
repo you just created. **Important:** in the project settings, set **Root
Directory** to `seedance-workspace` (since the app lives in that
subfolder). Add environment variable `KIE_API_KEY` with your real key, then
deploy. You'll get a URL like `https://seedance-workspace.vercel.app`.

### Step 5 — Point the app at that URL

Back on github.com (no Codespace needed for this small edit):

1. Navigate to `seedance-workspace/capacitor.config.ts` in your repo.
2. Click the pencil (✏️) icon to edit it directly in the browser.
3. Replace the placeholder URL with your real Vercel URL, then click
   **Commit changes**.

### Step 6 — Build the APK

1. Go to the **Actions** tab on your repo.
2. Click **Build Android APK** in the left sidebar → **Run workflow** →
   **Run workflow** (green button).
3. Wait 3–5 minutes for it to finish (a spinning yellow dot turns into a
   green checkmark).
4. Click into the finished run → scroll down to **Artifacts** →
   download **seedance-workspace-debug-apk**. It downloads as a `.zip` —
   unzip it once more to get the actual `app-debug.apk`.

### Step 7 — Get it onto your phone

Send `app-debug.apk` to your phone the same way you'd send any file — email
it to yourself, upload it to Google Drive and open the link on your phone,
or send it via WhatsApp. Tap it on the phone to install. Android will warn
it's from an "unknown source" since it's not from the Play Store — that's
expected for a debug build, allow it.

---

## Notes

- This is a **debug build** — fine for your own phone or sharing with a
  few people directly. Getting it onto the Play Store is a separate step
  (needs a signed release build and a one-time $25 developer account) — ask
  if you want that walkthrough later.
- The app icon is still Capacitor's default placeholder. Quickest fix:
  in Android Studio, right-click `app/res` → New → Image Asset, and drop in
  a logo — it generates all the required sizes for you. (Path B users can
  skip this for now — it's cosmetic.)
- Nothing sensitive lives in the APK. It's a shell that loads your URL —
  the `KIE_API_KEY` stays server-side on Vercel, never inside the app.
- Any time you change `capacitor.config.ts`, re-run the "Build Android
  APK" workflow (Path B) or `npx cap sync android` + rebuild in Android
  Studio (Path A) to pick up the change.

