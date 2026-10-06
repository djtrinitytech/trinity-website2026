# DJS Trinity 2026 — Admin CMS & Supabase Setup Guide

This guide provides step-by-step instructions to configure Supabase for managing Trinity 2026's **Announcements** and **Homepage Gallery** through the `/admin` CMS.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose your organization, project name (e.g. `djs-trinity-2026`), and a secure database password.
4. Select a region close to your users (e.g., `South Asia (Mumbai)`).
5. Wait for the database to finish provisioning (~1–2 minutes).

---

## 2. Run Database Migration Schema

1. In your Supabase dashboard, click the **SQL Editor** tab (terminal icon `>_` on the left sidebar).
2. Click **New query**.
3. Open [`supabase/schema.sql`](file:///c:/Users/Deepam%20SIpani/OneDrive/Desktop/trinity_website/supabase/schema.sql) in this repository and copy all its contents.
4. Paste the SQL into the Supabase SQL Editor and click **Run** (or `Ctrl+Enter`).
5. Verify in the output that all tables, triggers, indexes, and RLS policies were created successfully:
   - `public.admin_profiles`
   - `public.announcements`
   - `public.gallery_items`
   - `storage.buckets` (`gallery`)

---

## 3. Verify Storage Bucket

1. In Supabase, navigate to **Storage** on the left menu.
2. Confirm that a bucket named `gallery` exists and is marked as **Public**.
   - If not created, click **New bucket**, name it `gallery`, check **Public bucket**, and save.
3. The policies in `schema.sql` already grant:
   - **Public Read** for everyone.
   - **Upload / Update / Delete** restricted strictly to authenticated admins.

---

## 4. Enable Email / Password Authentication

1. Go to **Authentication** → **Providers** in Supabase.
2. Ensure **Email** is enabled.
3. Under **Email Auth Settings**:
   - Turn **OFF** "Confirm email" if you want created admin accounts to be active immediately without email confirmation links.

---

## 5. Create Your First Admin User

Public registration is intentionally disabled. You create admin users in Supabase:

1. In the Supabase dashboard, go to **Authentication** → **Users**.
2. Click **Add user** → **Create user**.
3. Enter the admin email (e.g. `admin@djtrinity.org`) and a strong password.
4. Check **Auto-confirm user** (if available) and click **Create user**.
5. Once created, copy the **User UID** (a UUID like `e7f89b21-4d32-4871-92b3-1897c73a90f1`).

---

## 6. Grant Admin Role in `admin_profiles`

1. Open the **SQL Editor** tab in Supabase again.
2. Run this query, replacing `<USER_UID>` and `<ADMIN_EMAIL>` with the values from Step 5:

```sql
INSERT INTO public.admin_profiles (user_id, email, role)
VALUES ('<USER_UID>', '<ADMIN_EMAIL>', 'admin');
```

*Example:*
```sql
INSERT INTO public.admin_profiles (user_id, email, role)
VALUES ('e7f89b21-4d32-4871-92b3-1897c73a90f1', 'admin@djtrinity.org', 'admin');
```

---

## 7. Configure Frontend Environment Variables

1. In your Supabase dashboard, go to **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API keys** → `anon` / `public` key (long JWT string)
3. In the root of your project, create or edit your `.env` file:

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> **CRITICAL SECURITY RULE:**
> NEVER copy or expose the `service_role` secret key!
> Only the public `anon` key belongs in Vite frontend files. The `service_role` key bypasses all Row Level Security and must NEVER be placed in client-side code or Git.

---

## 8. Run the Website & Access Admin CMS

1. Start the Vite dev server:
   ```bash
   npm run dev
   ```
2. Navigate to:
   ```
   http://localhost:5173/admin/login
   ```
3. Sign in using the email and password you created in Step 5.
4. You will enter the **Anugatha Archive Control** CMS dashboard (`/admin`):
   - **Announcements Manager (`/admin/announcements`):** Create, schedule, edit, prioritize, and publish notices live to `/announcements`.
   - **Gallery Archive (`/admin/gallery`):** Drag-and-drop upload photos, toggle Homepage ON/OFF, reorder images with `↑` and `↓` buttons, and edit descriptions.

---

## Summary of Architecture & Data Flow

- **Admins:** Manage notices & photos in `/admin` with real-time feedback (toasts, confirmation modals).
- **Supabase Storage:** Stores optimized image assets in `gallery/2026/[event-name]/...`.
- **Public Website (`/` and `/announcements`):**
  - Fetches only `published = true` items.
  - Homepage DNA Carousel queries `published = true AND homepage_featured = true ORDER BY display_order ASC`.
  - Offline / fallback data is automatically displayed if Supabase is temporarily unreachable or undergoing maintenance.
