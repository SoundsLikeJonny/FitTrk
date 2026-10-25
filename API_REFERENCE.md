# FitTracker API Reference

All endpoints are under `https://fittracker.abacusai.app`.
Mobile clients authenticate via `POST /api/mobile-auth/login` → Bearer token.

| Method | Path | operationId | Auth | Description |
|--------|------|-------------|------|-------------|
| GET | `/api/foods` | listFoods | ✅ | List foods (shared library + user custom), max 100 |
| POST | `/api/foods` | createFood | ✅ | Create a custom food |
| PUT | `/api/foods/{id}` | updateFood | ✅ | Update a food (incl. presets) |
| DELETE | `/api/foods/{id}` | deleteFood | ✅ | Delete a food |
| GET | `/api/daily-log` | getDailyLog | ✅ | Get (or create) the food log for a date |
| POST | `/api/daily-log` | addFoodEntry | ✅ | Add a food entry to a day |
| PUT | `/api/daily-log/{id}` | updateFoodEntry | ✅ | Update a food entry's multiplier/amount |
| DELETE | `/api/daily-log/{id}` | deleteFoodEntry | ✅ | Delete a food entry |
| GET | `/api/settings` | getSettings | ✅ | Get (or create) user settings |
| PUT | `/api/settings` | updateSettings | ✅ | Update user settings |
| GET | `/api/weight-log` | listWeightLogs | ✅ | List weight logs, newest first |
| POST | `/api/weight-log` | upsertWeightLog | ✅ | Record weight for a date |
| GET | `/api/exercises` | listExercises | ✅ | List exercises (library + custom) |
| POST | `/api/exercises` | createExercise | ✅ | Create a custom exercise |
| PUT | `/api/exercises/{id}` | updateExercise | ✅ | Update an exercise (incl. restSeconds) |
| DELETE | `/api/exercises/{id}` | deleteExercise | ✅ | Delete an exercise |
| GET | `/api/workouts` | listWorkouts | ✅ | List workout templates |
| POST | `/api/workouts` | createWorkout | ✅ | Create a workout template |
| GET | `/api/workouts/{id}` | getWorkout | ✅ | Get a workout template |
| PUT | `/api/workouts/{id}` | updateWorkout | ✅ | Replace a workout template's name/exercises |
| DELETE | `/api/workouts/{id}` | deleteWorkout | ✅ | Delete a workout template |
| GET | `/api/sessions` | listSessions | ✅ | List finished workout sessions (history) |
| POST | `/api/sessions` | startSession | ✅ | Start a workout session (optionally from a template) |
| GET | `/api/sessions/{id}` | getSession | ✅ | Get a workout session |
| PUT | `/api/sessions/{id}` | updateSession | ✅ | Update/finish a session and bulk-update sets |
| DELETE | `/api/sessions/{id}` | deleteSession | ✅ | Delete a session |
| POST | `/api/sessions/{id}/sets` | addSessionSet | ✅ | Add a set to a session |
| PUT | `/api/sessions/{id}/sets` | updateSessionSet | ✅ | Update a single set |
| POST | `/api/scan-label` | scanLabel | ✅ | AI nutrition label extraction (SSE stream) |
| POST | `/api/upload/presigned` | createPresignedUpload | ✅ | Get a presigned upload URL for cloud storage |
| POST | `/api/signup` | signupWeb | ❌ | Create an email/password account (web) |
| POST | `/api/auth/login` | checkCredentials | ❌ | Validate email/password (web, no session) |

### Mobile Auth (not in openapi.json — platform-managed)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mobile-auth/signup` | Create account, returns bearer token |
| POST | `/api/mobile-auth/login` | Login, returns bearer token |
| GET | `/api/mobile-auth/me` | Get current user from bearer token |
