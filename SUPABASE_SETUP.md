# Supabase setup for Sponto

The application code, schema, row-level security policies, seed content, authentication UI, and AI Edge Function are included. Complete these one-time steps against your Supabase project.

## Production status

Deployed on 15 November 2026 to project `quyypjsafhwhgqpqjvhq` in Mumbai:

- Database schema and starter learning content applied
- `critique-attempt` Edge Function active with JWT verification
- `gemini-live-token` Edge Function active for one-use Gemini Live session tokens
- Mobile `.env` connected with the client-safe publishable key
- RLS verified on every public application table
- Supabase security and performance advisors: no warning-level findings

AI coaching and live voice onboarding can use the Google key a user saves under **Profile → AI provider and model**. Configure a managed server key in step 3 only if signed-in users should receive AI features without supplying their own key.

## 1. Connect the mobile app

In the Supabase dashboard, open **Project Settings → API** and copy the project URL and publishable key. Then run:

```sh
cd mobile
cp .env.example .env
```

Fill in `mobile/.env`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The publishable key is designed for clients. Never put a service-role key or AI provider key in this file.

## 2. Apply the database schema

From the workspace root:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

This applies the schema and starter learning-content migrations under `supabase/migrations`. The schema enables RLS on every public table and explicitly grants only the required Data API access.

## 3. Deploy AI coaching

Set at least one managed provider key. Google is the default:

```sh
npx supabase secrets set GOOGLE_AI_API_KEY=YOUR_GOOGLE_KEY
```

Optional providers:

```sh
npx supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_KEY
npx supabase secrets set ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
```

Then deploy both AI functions:

```sh
npx supabase functions deploy critique-attempt
npx supabase functions deploy gemini-live-token --no-verify-jwt
```

Users can alternatively paste their own provider key in **Profile → AI provider and model**. Native builds encrypt it in device secure storage; web preview keeps it only in memory. The key is sent over HTTPS only to the coaching function and is not stored in the database.

## 4. Start and test

From the workspace root:

```sh
./start-app.sh
```

Open **Profile → Sign in**, create an account, complete onboarding, and submit a drill. If email confirmation is enabled in Supabase Auth, confirm the email before signing in.

### Test live voice onboarding

Gemini Live uses native full-duplex audio, so it needs a development build and does not run in Expo Go. On macOS with Xcode installed:

```sh
./start-app.sh native-ios
```

With Android Studio and an emulator or connected device:

```sh
./start-app.sh native-android
```

In Sponto, open **AI settings**, select Google, save a Gemini API key, return to onboarding, and choose **Talk it through with Gemini Live**. Audio is sent directly to Gemini with a one-use token and is not stored by Sponto.
