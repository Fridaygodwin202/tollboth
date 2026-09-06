-- Run this manually in the Supabase SQL editor for your project.
-- Not yet applied anywhere — no live Supabase project is connected in the
-- build environment (no network access). Applying this is the first real
-- verification step for the decision-log code in apps/api/src/lib/decision-log.ts.

create table if not exists decision_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  resource text not null,
  reason text not null,
  amount_usd numeric not null,
  decision text not null check (decision in ('approved', 'denied')),
  denial_reason text,
  tx_signature text
);

create index if not exists decision_log_created_at_idx
  on decision_log (created_at desc);

-- No RLS policy defined yet: this table is only ever written/read by
-- apps/api using the Supabase service role key (server-side), never
-- directly from apps/web with the anon key. If that changes, RLS needs to
-- be added deliberately, not skipped.
alter table decision_log enable row level security;
