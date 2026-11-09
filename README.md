# Emkron Motors

Your original Gemini design, unchanged, now reading its cars from Supabase.
Hosted as a static site on Cloudflare Pages.

## What's done
- Cars load from the Supabase `listings` table. Until `.env` is filled in, the demo cars still show.
- Removed: Gemini/Express/Django leftovers and the "code exporter" links. Design, logo path and images untouched.
- The old Admin Moderation (listing review) page is removed.
- Phone/WhatsApp is set once in `src/config.ts` (09068863369).
- Admin panel at `/admin` (not linked anywhere on the public site): log in, add/edit cars, upload photos (resized automatically), set the cover photo, mark Available / Sold / Hidden, feature a car, delete.
- Single seller: "Sell My Car" in the header opens WhatsApp to your number. The old sell form, seller dashboard and fake login are gone.

- Every car has its own shareable link (`/cars/<car-name>`), and brand/state/body-type pages have real URLs too. Refresh, back/forward and shared links all work.

## Not done yet
- Link previews: pasting a car link into WhatsApp shows the generic site preview, not that car's photo and price. Fixing this needs a small Cloudflare Pages Function.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor -> New query -> paste `supabase/schema.sql` -> Run.
3. Authentication -> Users -> Add user (your email + a strong password, tick "Auto confirm"). Then Authentication -> Sign In / Providers -> turn OFF "Allow new users to sign up".
4. Make yourself admin: run this in the SQL Editor with your email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
5. (Optional) Uncomment the test car at the bottom of that file and run it to confirm the connection.
6. Project Settings -> API: copy the Project URL and the anon public key.

## 2. Run locally
```bash
cp .env.example .env     # add the Supabase URL/key
npm install
npm run dev
```
Logo: `public/assets/emkron-logo.png` (already included).

## 3. Cloudflare Pages
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git.
3. Build command: `npm run build`   Output directory: `dist`
4. Settings -> Variables: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and (optional) `VITE_BUSINESS_LOCATION`.
5. Deploy. `.node-version` makes Cloudflare use Node 22, which Vite needs.

The anon key is meant to be public; Row Level Security in `schema.sql` protects the data. Never put the `service_role` key in this project.
