# ZeroDayHeist CTF Certificate Portal — Setup Guide v2

## What's new in v2
- **2 Certificate Types**: Participants get `certificate_participant.png`, Grand Finale gets `certificate.png`
- **2 Supabase Tables**: `participants` and `grandfinale`
- **ID Prefixes**: `ZDH-2026-XXXX` for participants, `ZDH-GF-XXXX` for Grand Finale
- **Stats**: Shows separate counts for both

---

## Step 1 — Add Certificate Images

Place both images in `public/`:

| File | Used For |
|------|----------|
| `public/certificate.png` | Grand Finale certificates |
| `public/certificate_participant.png` | Participant certificates |

Both files are already present as placeholders — replace with your real designs.

---

## Step 2 — Create Supabase Tables (run once)

Open: https://supabase.com/dashboard/project/fyhqlyfqepkkithfikxu/sql/new

Paste the full contents of `supabase_schema.sql` and click **Run**.

This creates:
- `participants` table (RLS enabled, public read + insert)
- `grandfinale` table (RLS enabled, public read + insert)
- No public delete or update on either table

---

## Step 3 — Run the App

```bash
cd ctf-final
npm install
npm run dev
```

App opens at http://localhost:3000

---

## How it works

- **Claim Certificate tab** → Switch between "Participants Certificate" and "Grand Finale Certificate"
- **Search** → Searches only the selected section's table
- **Register** → Inserts into the correct table based on section
- **Verify Credentials tab** → Checks BOTH tables automatically
- **Admin** → Set rank/score via Supabase Dashboard only (no public update)
