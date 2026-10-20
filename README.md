# Melodiva Music Website

Portfolio website for the Yogyakarta live band **Melodiva**, plus a private admin panel at `/admin`.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · motion · Supabase · Resend + React Email · Zod · Recharts.

## 1. Run locally

```bash
pnpm install
cp .env.example .env.local   # fill in what you have; empty values = demo mode
pnpm dev                     # http://localhost:3000
pnpm typecheck && pnpm build # before deploying
```

## 2. Supabase (database + admin login)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/migrations/001_init.sql` (tables, `is_admin()`, indexes, RLS on every table).
3. Copy **Project URL**, **anon key**, and **service_role key** from *Project Settings > API* into the env vars.
4. Create the first admin:
   - *Authentication > Users > Add user* (email + password, tick "Auto confirm").
   - Run in SQL Editor:
     ```sql
     insert into public.admin_users (id, email, role)
     select id, email, 'owner' from auth.users where email = 'you@example.com';
     ```
5. *Authentication > URL Configuration*: set **Site URL** to your domain and add `https://YOUR-DOMAIN/auth/confirm` to **Redirect URLs** (needed for "Lupa kata sandi").
6. Optional 2FA: log in, open **Pengaturan > Verifikasi dua langkah**, scan the QR code with Google Authenticator / Authy.

## 3. Resend (email)

1. Create an API key at [resend.com](https://resend.com) → `RESEND_API_KEY`.
2. *Domains > Add domain*, add the DNS records shown, wait until **Verified**.
3. Set `EMAIL_FROM` (an address on that domain), `EMAIL_REPLY_TO` (the band's normal inbox), and `ADMIN_NOTIFICATION_EMAIL`.

Messages are always saved first; if email fails it is only logged, nothing is lost.

## 4. Cloudflare Turnstile (anti-spam)

Cloudflare dashboard → *Turnstile → Add site* → add your domain → copy the **Site key** to `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret key** to `TURNSTILE_SECRET_KEY`.

## 5. Editing content (no code needed)

All public content lives in `src/data/*.json`. Content is validated with Zod at build time, so a typo shows a clear error instead of a broken page.

| File | What it controls |
| --- | --- |
| `site.json` | Band name, tagline, WhatsApp number, email, service area, reply time, SEO |
| `socials.json` | Social media links (header, footer, contact page) |
| `history.json` | Story and timeline on /tentang |
| `members.json` | The 6 members, bios, portfolio, gallery, socials |
| `performances.json` | Venues on /pernah-tampil (`featured: true` shows on home) |
| `gallery.json` | Photos on /galeri (`category`, `width`, `height`) |
| `videos.json` | YouTube (`type: "youtube"`, `youtubeId`) or local mp4 (`type: "local"`, `src`) |
| `songs.json` | Song list on /lagu |
| `services.json` | Packages; `priceMode`: `fixed` · `starting` · `contact` |
| `testimonials.json`, `faq.json`, `stats.json`, `event-types.json` | Testimonials, FAQ, counters, event cards |

### Add a social media

Add **one** object to `src/data/socials.json`:

```json
{ "id": "tiktok", "label": "TikTok", "url": "https://tiktok.com/@melodiva", "icon": "tiktok",
  "showInHeader": false, "showInFooter": true, "showInContact": true }
```

Supported icons: `instagram`, `whatsapp`, `youtube`, `tiktok`, `facebook`, `spotify`, `x`, `link`.

## 6. Photos and videos

| Folder | Content |
| --- | --- |
| `public/images/logo/logo.png` | Real logo (a built-in SVG fallback is shown until it exists) |
| `public/images/hero/` | Hero poster and "about" image |
| `public/images/members/<slug>/` | Member photos (slug from `members.json`) |
| `public/images/gallery/` | Gallery photos |
| `public/images/performances/` | Performance photos |
| `public/videos/hero.mp4` | Optional short, muted hero loop |

Use WebP/JPG around 1600px wide. For long videos use YouTube links instead of local files.

## 7. Admin panel (`/admin`)

- **Dashboard**: stats, visitor and message charts, recent messages, upcoming bookings.
- **Inbox**: status tabs, search, detail, internal note, reply via email with templates, "Buka WhatsApp", "Jadikan booking". Client replies arrive in the band's normal inbox.
- **Booking** (private, never shown publicly): list + calendar, same-day conflict warning, CSV export.
- **Analitik**, **Pengaturan** (password, 2FA, templates, notification email), **Audit log**.

Every mutation is checked server-side (session + `admin_users` + 2FA level) and written to `audit_logs`.

## 8. Deploy to Vercel

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new) (or click **Publish** in v0).
2. Add all variables from `.env.example` under *Settings > Environment Variables*.
3. Deploy, then update the Supabase Site URL / Redirect URLs to the production domain.
