# StudyFlow License System

This branch adds a first-pass one-phone license activation flow.

## What it does
- The Android app obtains a random installation ID from app-private SharedPreferences.
- The buyer enters a unique activation code once.
- The Edge Function hashes the code and binds it to the first installation ID.
- The same code cannot activate a second phone unless an admin resets the device binding.
- The app stores a 30-day local validation window so an activated buyer can keep using the app offline. A block/revoke takes effect the next time the app successfully checks online (or after the cached window expires).

## Supabase setup (required before release)
1. Create a Supabase project.
2. Run `supabase/migrations/202611030001_license_system.sql` in the SQL Editor.
3. Deploy the `activate-license` Edge Function from `supabase/functions/activate-license/index.ts`.
4. Set the function's built-in Supabase secrets (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). Do not put the service-role key in Android, HTML, GitHub source, or chat.
5. Put the project URL and public anon/publishable key in `app/src/main/assets/license-config.js`. The public key is intended for client use; the service-role key is not.
6. Build and test on two separate Android phones before sending any APK to a customer.

## Create and manage codes
Use the SQL comments in the migration file. Generate a different, hard-to-guess code for every paid customer. Keep the original code in a private offline record; the database stores only its SHA-256 hash.

- Block: set `status = 'blocked'`.
- Revoke: set `status = 'revoked'`.
- Replacement phone: set `device_id = null, activated_at = null` after checking the customer's request.

## Important limitations
- This is a practical deterrent, not DRM. A modified APK can potentially bypass client-side checks.
- Reinstalling the app or factory-resetting the phone creates a new installation ID and requires an admin device reset.
- Offline validation is cached for up to 30 days, so a remote block cannot take effect while the phone remains offline during that period.
- The project must be configured and the app must be tested before commercial release. Do not sell this branch's APK while the Supabase configuration is blank.
