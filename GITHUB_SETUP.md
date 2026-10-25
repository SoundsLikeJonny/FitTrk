# CI/CD setup

> **Activation step (one time):** the workflow files are in `ci/github-workflows/` because the automation
> that opened this PR isn't allowed to write to `.github/workflows/` (GitHub's `workflows` permission).
> Move them into place from a local clone:
>
> ```bash
> git checkout ci/setup-workflows && git pull
> mkdir -p .github/workflows && git mv ci/github-workflows/*.yml .github/workflows/
> git commit -m "ci: activate workflows" && git push
> ```
>
> Or in the GitHub web UI: **Add file → Create new file**, name it `.github/workflows/mobile-apk.yml`, paste the
> contents, and repeat for `web-ci.yml`. The workflows don't run until they are in `.github/workflows/`.

Two GitHub Actions workflows (once they are in `.github/workflows/`):

| Workflow | File | Runs on | What it does |
|---|---|---|---|
| Mobile APK | `mobile-apk.yml` | push to `main` that touches `mobile/**` (or a manual run) | Builds an unsigned **debug** Android APK and publishes it as a GitHub Release |
| Web CI/CD | `web-ci.yml` | push / PR to `main` (skipped for `mobile/**` and `*.md`-only changes) | Checks that the Next.js app builds, then deploys it to **Vercel** (only on pushes to `main`) |

Both can also be started by hand from **Actions → (workflow) → Run workflow**.

---

## 1. Mobile APK (`mobile-apk.yml`)

No secrets are needed.

Steps: checkout → Java 17 (Temurin) → Node 20 → `yarn install --immutable` in `mobile/` (Yarn 4 via Corepack,
using the committed `mobile/yarn.lock`) → `npx expo prebuild --platform android` (this creates `mobile/android/`, which is gitignored)
→ `./gradlew assembleDebug` → upload the artifact → create a GitHub Release.

**Get the APK**
- **Releases** (sidebar on the repo home page) → newest `build-<N>` pre-release → download
  `FitTracker-build-<N>-debug.apk`. On Android, open the file and allow "Install unknown apps" when prompted.
- Or **Actions → Mobile APK → (run) → Artifacts → `fittracker-debug-apk`** (a zip, kept for 30 days).

**Backend URL:** by default the app is built with `EXPO_PUBLIC_API_URL=https://fit-trk.vercel.app`, the Vercel production URL.
To point builds at a different backend, set a repository **variable** (not a secret) named `EXPO_PUBLIC_API_URL`
under *Settings → Secrets and variables → Actions → Variables*. The next build will use that URL.

Notes: a debug APK is signed with Android's standard debug key, so you can sideload it but it can't go on the Play Store.
Adding a release keystore later means storing it as base64 secrets and running `assembleRelease`.

---

## 2. Web app on Vercel (`web-ci.yml`)

### One-time Vercel setup
1. Sign in at <https://vercel.com> with GitHub → **Add New → Project** → import `SoundsLikeJonny/FitTrk`.
   - Framework: Next.js (detected automatically). Root directory: `./`.
   - `vercel.json` already sets the install and build commands.
2. **Choose one way to deploy** so each push doesn't deploy twice:
   - **A. GitHub Actions deploys (this workflow):** Vercel project → Settings → Git → turn off automatic
     deployments (or disconnect the Git repo), then add the 3 secrets below.
   - **B. Vercel's Git integration deploys:** don't add `VERCEL_TOKEN`. The workflow still runs the build check and
     the deploy job is skipped.
3. **Database:** Vercel needs a PostgreSQL database it can reach from the internet (for example Vercel Postgres/Neon or Supabase).
   Put its connection string in `DATABASE_URL`, then create the tables once from your machine:
   `DATABASE_URL="<url>" npx prisma db push` (or `prisma migrate deploy` if you add migrations).
   CI does **not** run migrations.
4. **Environment variables:** Vercel → Project → Settings → Environment Variables (Production):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Postgres connection string |
   | `AUTH_SECRET` | random string: `openssl rand -base64 32` |
   | `AUTH_URL` (and `NEXTAUTH_URL`) | `https://fit-trk.vercel.app` |
   | `AUTH_TRUST_HOST` | `true` |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → APIs & Services → Credentials → OAuth client |
   | any others the app reads | e.g. S3/upload or LLM keys used by `/api/upload` and `/api/scan-label` |

### GitHub secrets (Settings → Secrets and variables → Actions → Secrets)

| Secret | Where to get it | Required? |
|---|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create | Yes, for deploy (option A) |
| `VERCEL_ORG_ID` | Run `npx vercel link` in a local clone → `.vercel/project.json` → `orgId` | Yes, for deploy |
| `VERCEL_PROJECT_ID` | same file → `projectId` | Yes, for deploy |
| `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | same values as above | Optional. The build check uses dummy values if they're missing |

Never commit `.vercel/` or any `.env` file. The root `.gitignore` already excludes `.env*`.

### What the workflow does
- **build job** (pushes and PRs): `npm install --legacy-peer-deps` → `prisma generate` → `next build`.
  Before generating, it removes the absolute `output = "/home/ubuntu/..."` line from `prisma/schema.prisma`
  so the client goes to the default `node_modules/.prisma/client`. The file in the repo is left as it is.
- **deploy job** (pushes to `main` only, and only when `VERCEL_TOKEN` is set): runs `vercel deploy --prod`. Vercel builds on
  its own servers with the env vars from step 4. The deployment URL appears in the run summary.

---

## 3. Domain

- **Production URL: `https://fit-trk.vercel.app`** (free Vercel subdomain, no registrar or renewal fees).

### Google OAuth (Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID)

| Setting | Value |
|---|---|
| Authorized JavaScript origins | `https://fit-trk.vercel.app` |
| Authorized redirect URIs | `https://fit-trk.vercel.app/api/auth/callback/google` |
| Authorized redirect URIs (mobile sign-in) | `https://fit-trk.vercel.app/api/mobile-auth/google/callback` |

Then set `AUTH_URL` and `NEXTAUTH_URL` to `https://fit-trk.vercel.app` in Vercel and redeploy.

### Optional: a custom domain later
- To use your own domain: Vercel → Project → **Settings → Domains → Add**, then create the DNS record Vercel shows you
  at your registrar: an `A` record to `76.76.21.21` for a root domain, or a `CNAME` to `cname.vercel-dns.com` for a subdomain.
  HTTPS certificates are issued automatically.
- **If the production URL ever changes from `fit-trk.vercel.app`, update** (replace `<domain>` with the new host):
  1. `AUTH_URL` / `NEXTAUTH_URL` in Vercel env vars (then redeploy).
  2. Google OAuth client → Authorized redirect URIs: `https://<domain>/api/auth/callback/google` and
     `https://<domain>/api/mobile-auth/google/callback`. Also add `https://<domain>` under Authorized JavaScript origins.
  3. The `EXPO_PUBLIC_API_URL` repository variable, so new APKs point to the new backend.
