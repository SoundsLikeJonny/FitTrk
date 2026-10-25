# Mobile app plan

FitTracker is a workout and nutrition tracking mobile app that lets users log daily food intake against macro targets (cut/bulk mode), run workout sessions from templates, and review workout history — sharing the existing web app's backend.

This app shares the backend of **Workout and Food Tracker**. Every API call goes through the generated hooks in `src/api/generated/`; this project has no backend of its own.

## Navigation

Tabs (4): Today · Workouts · History · Settings

```
app/
  _layout.tsx              # Root layout: AuthProvider, ThemeProvider, QueryClientProvider
  auth/
    _layout.tsx            # Stack layout; redirects to /tabs if authenticated
    login.tsx              # Login screen
    signup.tsx             # Signup screen
    callback.tsx           # Google SSO OAuth callback
  tabs/
    _layout.tsx            # <Tabs> layout; redirects to /auth/login if not authenticated. 4 tabs.
    index.tsx              # Today (food log)
    workouts.tsx           # Workouts list
    history.tsx            # Workout history
    settings.tsx           # Settings / profile
  food-picker.tsx          # Modal: search & pick food to add to daily log
  session/
    [id]/
      index.tsx            # Active workout session
  workout/
    [id]/
      index.tsx            # Workout template detail / start session
```

app/auth/_layout.tsx: if isLoading return Splash; if isAuthenticated return <Redirect href="/tabs" />; else render <Stack>. app/tabs/_layout.tsx: if isLoading return Splash; if !isAuthenticated return <Redirect href="/auth/login" />; else render <Tabs>. Auth state is provided by AuthProvider context wrapping useGetMobileAuthMe. Login/signup screens never call router.replace — layout guards handle transitions when auth state updates. Google SSO opens the web app's /api/mobile-auth/google endpoint in an in-app browser; the callback route at app/auth/callback.tsx extracts the token from the redirect URL and stores it, causing AuthProvider to flip isAuthenticated.

## Screens

### 1. Login

- **Route**: `app/auth/login.tsx`
- **Purpose**: Email/password login with a Google SSO button. Mirrors /login on the web app.
- **From the web app**: /login
- **Writes**: `useMobileLogin` (imperative: `mobileLogin`)
- **UI**: App logo and 'FitTracker' title in Plus Jakarta Sans display font. Email text input with floating label. Password text input with floating label and show/hide toggle. 'Sign In' gradient primary button. Divider with 'or' label. 'Sign in with Google' outlined button with Google icon. Footer text: 'Don't have an account?' with 'Sign Up' link that pushes signup screen.
- **Actions**: Enter email and password, tap Sign In to authenticate. Tap Google button to start OAuth flow in in-app browser. Tap Sign Up link to push signup screen.
- **States**: Loading: Sign In button shows spinner and is disabled during mutation. Error: shake animation on inputs, red error message below form ('Invalid email or password'). Network error: toast with retry.
- **Copy from the web app**: Sign In, Email, Password, or, Sign in with Google, Don't have an account?, Sign Up

### 2. Signup

- **Route**: `app/auth/signup.tsx`
- **Purpose**: Create a new account with name, email, and password. Mirrors /signup on the web app.
- **From the web app**: /signup
- **Writes**: `useMobileSignup` (imperative: `mobileSignup`)
- **UI**: App logo and 'Create Account' heading. Name, Email, Password, Confirm Password inputs with floating labels. 'Create Account' gradient primary button. Footer: 'Already have an account?' with 'Sign In' link.
- **Actions**: Fill form fields, tap Create Account. Tap Sign In to go back to login.
- **States**: Loading: button spinner. Error: field-level validation errors, shake animation. Success: AuthProvider state updates; layout switches to tabs.
- **Copy from the web app**: Create Account, Name, Email, Password, Confirm Password, Already have an account?, Sign In

### 3. Google SSO Callback

- **Route**: `app/auth/callback.tsx`
- **Purpose**: Handles the OAuth redirect from the Google SSO flow, extracts token from URL, stores it in AuthProvider.
- **From the web app**: /login (Google SSO feature)
- **Data**: none — this screen is static
- **UI**: Full-screen loading spinner with 'Signing you in…' text.
- **Actions**: Automatic — no user interaction. Parses token from deep link, stores in secure storage, AuthProvider re-evaluates and layout redirects.
- **States**: Loading: spinner. Error: 'Sign in failed' message with 'Try Again' button that navigates back to login.
- **Copy from the web app**: Signing you in…, Sign in failed, Try Again

### 4. Today (Food Log) — DEGRADED

- **Route**: `app/tabs/index.tsx`
- **Purpose**: Shows today's food entries with macro totals vs daily targets and progress bars. Users can add, edit, or remove food entries. Mirrors /today.
- **From the web app**: /today
- **Reads**: `useGetDailyLog`, `useGetSettings`
- **Writes**: `useDeleteFoodEntry` (imperative: `deleteFoodEntry`), `useUpdateFoodEntry` (imperative: `updateFoodEntry`)
- **UI**: Date header showing 'Today' with date. Calorie summary card: large calorie number, circular or bar progress. Macro progress bars for Protein, Carbs, Fat showing grams consumed vs target, colored segments. 'Add Food' FAB or button at bottom. Scrollable list of food entries — each row shows food name, amount, calories, with swipe-to-delete. Tapping an entry opens inline edit for multiplier/amount.
- **Actions**: Tap Add Food to open food-picker modal. Swipe entry to delete. Tap entry to edit amount/multiplier. Pull to refresh.
- **States**: Loading: skeleton shimmer for cards and list. Empty: illustration with 'No food logged today' and 'Add your first meal' prompt. Error: retry banner.
- **Copy from the web app**: Today, Calories, Protein, Carbs, Fat, Add Food, No food logged today, Add your first meal
- **Degraded**: useDeleteFoodEntry and useUpdateFoodEntry depend on unverified operations (deleteFoodEntry, updateFoodEntry). Editing and deleting entries may not work as expected.

### 5. Food Picker — DEGRADED

- **Route**: `app/food-picker.tsx`
- **Purpose**: Search and browse the food library, select a food and set amount/multiplier to add to today's log. Presented as a modal pushed from Today screen.
- **From the web app**: /today (add food flow)
- **Reads**: `useListFoods`
- **Writes**: `useAddFoodEntry` (imperative: `addFoodEntry`)
- **UI**: Search bar at top with real-time filtering. List of foods showing name, calories per serving, macros summary. Tapping a food opens a bottom sheet with amount input (grams or multiplier), macro preview, and 'Add' button.
- **Actions**: Type to search/filter foods. Tap food to select. Adjust amount. Tap Add to create food entry and dismiss modal.
- **States**: Loading: skeleton list. Empty search: 'No foods found' message. Error: retry.
- **Copy from the web app**: Search foods, No foods found, Amount, Add, cal, protein, carbs, fat
- **Degraded**: useAddFoodEntry depends on unverified addFoodEntry operation.

### 6. Workouts

- **Route**: `app/tabs/workouts.tsx`
- **Purpose**: Browse workout templates. Tap a template to view details or start a session. Mirrors /workouts.
- **From the web app**: /workouts
- **Reads**: `useListWorkouts`
- **UI**: Page header 'Workouts'. List of workout template cards showing template name, number of exercises, last used date. Each card is tappable. 'Create Workout' button or FAB.
- **Actions**: Tap a workout card to push workout detail screen. Tap Create Workout to push creation flow (degraded).
- **States**: Loading: skeleton cards with shimmer. Empty: 'No workouts yet' with 'Create your first workout' prompt. Error: retry.
- **Copy from the web app**: Workouts, Create Workout, No workouts yet, Create your first workout

### 7. Workout Detail — DEGRADED

- **Route**: `app/workout/[id]/index.tsx`
- **Purpose**: View a workout template's exercises and start a new session from it.
- **From the web app**: /workouts (template detail)
- **Reads**: `useGetWorkout`
- **Writes**: `useStartSession` (imperative: `startSession`)
- **UI**: Template name as header. List of exercises with sets × reps, weight, weight type badge (barbell/dumbbell/kettlebell/bodyweight). 'Start Workout' gradient primary button at bottom.
- **Actions**: Review exercises. Tap Start Workout to create a session and push to active session screen.
- **States**: Loading: skeleton. Error: retry with back navigation.
- **Copy from the web app**: Start Workout, sets, reps, Rest
- **Degraded**: useGetWorkout and useStartSession depend on unverified operations (getWorkout, startSession).

### 8. Active Session — DEGRADED

- **Route**: `app/session/[id]/index.tsx`
- **Purpose**: Active workout session screen. Log sets (reps, weight) for each exercise, with rest timer between sets. Mirrors /session/[id].
- **From the web app**: /session/[id]
- **Reads**: `useGetSession`, `useListExercises`
- **Writes**: `useAddSessionSet` (imperative: `addSessionSet`), `useUpdateSessionSet` (imperative: `updateSessionSet`), `useUpdateSession` (imperative: `updateSession`)
- **UI**: Session name header with elapsed timer. Exercise cards in order — each shows exercise name, weight type badge, and a table of sets (set number, weight input, reps input, completed checkbox). Rest timer overlay/bottom sheet that counts down between sets with haptic on completion. 'Finish Workout' button at bottom. Notes text input.
- **Actions**: Tap set row to mark complete. Edit weight and reps inline. Rest timer auto-starts on set completion (configurable duration from settings restTimerDefault). Tap Finish Workout to end session.
- **States**: Loading: skeleton. Error: retry. Timer: countdown overlay with pause/skip.
- **Copy from the web app**: Finish Workout, Rest Timer, Set, Weight, Reps, Done, Skip Rest, Notes
- **Degraded**: useGetSession, useAddSessionSet, useUpdateSessionSet, useUpdateSession are all unverified operations.

### 9. History

- **Route**: `app/tabs/history.tsx`
- **Purpose**: List of past workout sessions with date, name, and duration. Mirrors /history.
- **From the web app**: /history
- **Reads**: `useListSessions`
- **UI**: Page header 'History'. Scrollable list of session cards showing session name, date, duration, number of exercises. Cards are tappable to view session detail.
- **Actions**: Tap a session card to push to session detail (reuses Active Session screen in read-only mode). Pull to refresh.
- **States**: Loading: skeleton list with shimmer. Empty: 'No workouts yet' with encouragement text. Error: retry.
- **Copy from the web app**: History, No workouts yet, Start your first workout

### 10. Settings — DEGRADED

- **Route**: `app/tabs/settings.tsx`
- **Purpose**: Profile settings: cut/bulk mode toggle, daily macro targets, weight, rest timer default, and logout. Mirrors /settings.
- **From the web app**: /settings
- **Reads**: `useGetSettings`, `useGetMobileAuthMe`
- **Writes**: `useUpdateSettings` (imperative: `updateSettings`)
- **UI**: Page header 'Settings'. User info section showing name and email from auth. Mode toggle: segmented control for 'Cut' / 'Bulk'. Weight input with unit toggle (lb/kg). Macro multiplier inputs: calorie multiplier, protein multiplier, protein min, fat min. Cut deficit / Bulk surplus input (contextual based on mode). Rest timer default input (seconds). 'Save' gradient button. 'Sign Out' destructive button at bottom.
- **Actions**: Toggle cut/bulk mode. Edit numeric fields. Tap Save to persist. Tap Sign Out to clear auth state (AuthProvider updates, layout redirects to login).
- **States**: Loading: skeleton form. Error: toast on save failure. Success: toast 'Settings saved'.
- **Copy from the web app**: Settings, Cut, Bulk, Weight, Calorie Multiplier, Protein Multiplier, Fat Min, Rest Timer, Save, Sign Out, Settings saved
- **Degraded**: useUpdateSettings depends on unverified updateSettings operation.

## Design

Taken from Workout and Food Tracker, adapted for mobile.

- **Palette**: Primary: hsl(142 71% 45%) — vibrant green for buttons, accents, progress bars, ring focus. Background light: hsl(0 0% 100%), dark: hsl(222 47% 6%). Card light: hsl(0 0% 100%), dark: hsl(222 47% 9%). Foreground light: hsl(222 47% 11%), dark: hsl(210 40% 98%). Muted light: hsl(210 40% 96%), dark: hsl(217 33% 17%). Muted-foreground light: hsl(215 16% 47%), dark: hsl(215 20% 55%). Destructive: hsl(0 84% 60%) light / hsl(0 63% 31%) dark. Border light: hsl(214 32% 91%), dark: hsl(217 33% 17%).
- **Typography**: Display/headings: Plus Jakarta Sans (font-display), tracking-tight on 24px+. Body/labels: DM Sans (font-sans). Numeric data, timers: JetBrains Mono (font-mono). Scale: Display 28-36px, Heading 20-24px, Body 16px, Caption 12-14px.
- **Mobile adaptations**: Dark mode as default (matching web app's defaultTheme='dark'). Touch targets enlarged to 48px minimum for set checkboxes and action buttons. Hover states replaced with press scale 0.97 + haptic feedback. Bottom nav uses 64px height with safe area insets. Cards use 12-16px border radius. Macro progress bars use primary green fill. Gradient buttons use primary green to slightly lighter green. Glass/translucent card backgrounds on nav bar with backdrop blur matching web's bg-card/95 backdrop-blur-sm.

## Out of scope

- **Food scanning (barcode/label camera)** — The scan feature uses createPresignedUpload and scanLabel which are unverified, and the camera-based label scanning flow is a secondary feature better suited for a future iteration.
- **Exercise CRUD (create/edit/delete custom exercises)** — createExercise, updateExercise, deleteExercise are all unverified. Users can use existing exercises from the seeded library. Custom exercise management is a power-user feature.
- **Food CRUD (create/edit/delete custom foods)** — createFood, updateFood, deleteFood are unverified. The 61 seeded foods cover the primary use case.
- **Workout template CRUD (create/edit/delete)** — createWorkout, updateWorkout, deleteWorkout are unverified. Users can browse and start existing templates. Template management can be done on the web app.
- **Weight logging** — upsertWeightLog is unverified. Weight log is a secondary tracking feature.
- **Admin/back-office surfaces** — Not applicable to end-user mobile app.
- **Marketing/landing pages** — Mobile app opens directly to product screens.

## Needs a backend change

These require the API to change, which happens in the Workout and Food Tracker conversation — not here.

- **Verified responses for core mutation operations (addFoodEntry, updateFoodEntry, deleteFoodEntry, startSession, addSessionSet, updateSessionSet, updateSession, updateSettings)** — These operations back primary user flows (food logging, workout sessions, settings) but were never exercised against the running app, so their response shapes and error handling are unproven. Blocks: Full confidence in Today food log editing, active workout session logging, and settings persistence. Screens are planned as degraded until verified.
- **Google SSO token exchange endpoint documentation** — The mobile app needs to know the exact flow: does /api/mobile-auth/google return a redirect URL? Does the callback return a JWT or session token? The endpoint exists but the contract for mobile OAuth (deep link callback with token) needs confirmation. Blocks: Google SSO login button functionality.
