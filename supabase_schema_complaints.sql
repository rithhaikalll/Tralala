-- SQL provided by user for facility_complaints integration

begin;

create type complaint_status as enum (
  'Submitted',
  'In Progress',
  'Resolved',
  'Rejected'
);

create type complaint_priority as enum (
  'Low',
  'Medium',
  'High',
  'Urgent'
);

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff', false);
$$;

create table if not exists public.facility_complaints (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  student_user_id uuid not null references auth.users(id) on delete cascade,
  student_name text,
  student_matric_id text,

  facility_name text not null,
  category text not null,
  title text not null,
  description text not null,

  status complaint_status not null default 'Submitted',

  priority complaint_priority not null default 'Medium',
  assigned_to text,

  staff_user_id uuid references auth.users(id) on delete set null,
  staff_remarks text,

  photo_url text,

  resolved_at timestamptz,
  rejected_at timestamptz
);

create index if not exists idx_facility_complaints_student_user_id
  on public.facility_complaints(student_user_id);

create index if not exists idx_facility_complaints_status
  on public.facility_complaints(status);

create index if not exists idx_facility_complaints_created_at
  on public.facility_complaints(created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_facility_complaints_updated_at on public.facility_complaints;

create trigger trg_facility_complaints_updated_at
before update on public.facility_complaints
for each row
execute function public.set_updated_at();

alter table public.facility_complaints enable row level security;

create policy "student can select own complaints"
on public.facility_complaints
for select
using (
  auth.uid() = student_user_id
);

create policy "student can insert own complaints"
on public.facility_complaints
for insert
with check (
  auth.uid() = student_user_id
);

create policy "student can update own complaint only when still submitted"
on public.facility_complaints
for update
using (
  auth.uid() = student_user_id
  and status = 'Submitted'
)
with check (
  auth.uid() = student_user_id
  and status = 'Submitted'
);

create policy "student can delete own complaint only when still submitted"
on public.facility_complaints
for delete
using (
  auth.uid() = student_user_id
  and status = 'Submitted'
);

create policy "staff can select all complaints"
on public.facility_complaints
for select
using (
  public.is_staff()
);

create policy "staff can update all complaints"
on public.facility_complaints
for update
using (
  public.is_staff()
)
with check (
  public.is_staff()
);

create or replace view public.v_staff_complaint_badge as
select
  count(*) filter (where status in ('Submitted','In Progress')) as pending_count,
  count(*) filter (
    where status in ('Submitted','In Progress')
    and created_at < now() - interval '7 days'
  ) as overdue_count
from public.facility_complaints;

create or replace view public.v_student_complaint_badge as
select
  student_user_id,
  count(*) filter (where status in ('Submitted','In Progress')) as active_count
from public.facility_complaints
group by student_user_id;

grant select on public.facility_complaints to authenticated;
grant select on public.v_staff_complaint_badge to authenticated;
grant select on public.v_student_complaint_badge to authenticated;

commit;
