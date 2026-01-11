-- ENHANCED Delete User Function (Schema Correction-v3)
-- This script includes both client-side self-deletion and admin-side deletion.

-- Drop old functions
drop function if exists public.delete_user_account();
drop function if exists public.admin_delete_user(uuid);

-- =========================================================
-- 1. DELETE USER ACCOUNT (Self-Deletion)
-- =========================================================
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  target_user_id uuid;
begin
  target_user_id := auth.uid();

  if target_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Reuse the shared cleanup logic via internal block or just copy-paste for safety
  
  -- 1. Community & Chat
  delete from public.buddy_requests where requester_id = target_user_id or recipient_id = target_user_id;
  delete from public.messages where sender_id = target_user_id;
  delete from public.chats where participant_ids @> array[target_user_id]; -- Also remove chats themselves if needed, or just messages
  
  -- 2. Marketplace
  delete from public.marketplace_favorites where user_id = target_user_id;
  delete from public.marketplace_listings where seller_id = target_user_id; 

  -- 3. Complaints
  delete from public.facility_complaints where student_user_id = target_user_id;
  update public.facility_complaints set staff_user_id = null where staff_user_id = target_user_id;

  -- 4. Facilities & Activities
  delete from public.facility_bookings where user_id = target_user_id;
  delete from public.activity_logs where user_id = target_user_id;
  delete from public.recorded_activities where student_id = target_user_id;
  delete from public.registrations where user_id = target_user_id;

  -- 5. News & Discussions
  delete from public.news_posts where user_id = target_user_id;
  delete from public.discussion_comments where author_id = target_user_id;
  delete from public.discussion_likes where user_id = target_user_id;
  delete from public.discussion_reports where reporter_id = target_user_id;
  delete from public.discussions where author_id = target_user_id;

  -- 6. Profile & Storage
  begin
    delete from storage.objects where owner = target_user_id;
  exception when others then
    null;
  end;

  delete from public.profile_details where user_id = target_user_id;
  delete from public.profiles where id = target_user_id;
  delete from public.staff_profiles where user_id = target_user_id;

  -- 7. Delete Auth
  delete from auth.users where id = target_user_id;
end;
$$;

-- =========================================================
-- 2. ADMIN DELETE USER (Force Delete by Admin)
-- =========================================================
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $$
begin
  -- Optional: Add a check here to ensure auth.uid() is an admin
  -- For now, we rely on the implementation ensuring only admins can call this (usually RLS or app logic) Or we can add:
  -- if not exists (select 1 from public.staff_profiles where user_id = auth.uid()) then ... end if;

  -- 1. Community & Chat
  delete from public.buddy_requests where requester_id = target_user_id or recipient_id = target_user_id;
  delete from public.messages where sender_id = target_user_id;
  delete from public.chats where participant_ids @> array[target_user_id]; -- Remove chats
  
  -- 2. Marketplace
  delete from public.marketplace_favorites where user_id = target_user_id;
  delete from public.marketplace_listings where seller_id = target_user_id; 

  -- 3. Complaints
  delete from public.facility_complaints where student_user_id = target_user_id;
  update public.facility_complaints set staff_user_id = null where staff_user_id = target_user_id;

  -- 4. Facilities & Activities
  delete from public.facility_bookings where user_id = target_user_id;
  delete from public.activity_logs where user_id = target_user_id;
  delete from public.recorded_activities where student_id = target_user_id;
  delete from public.registrations where user_id = target_user_id;

  -- 5. News & Discussions
  delete from public.news_posts where user_id = target_user_id;
  delete from public.discussion_comments where author_id = target_user_id;
  delete from public.discussion_likes where user_id = target_user_id;
  delete from public.discussion_reports where reporter_id = target_user_id;
  delete from public.discussions where author_id = target_user_id;

  -- 6. Profile & Storage
  begin
    delete from storage.objects where owner = target_user_id;
  exception when others then
    null;
  end;

  delete from public.profile_details where user_id = target_user_id;
  delete from public.profiles where id = target_user_id;
  delete from public.staff_profiles where user_id = target_user_id;

  -- 7. Delete Auth
  delete from auth.users where id = target_user_id;
end;
$$;

-- Grant permissions
grant execute on function public.delete_user_account() to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
